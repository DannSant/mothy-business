import { Component, inject, signal, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus } from '../../interfaces/order.interface';
import { OrderDetail } from '../../interfaces/order-detail.interface';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { SweetAlertModalComponent } from '../../components/sweet-alert-modal/sweet-alert-modal.component';

@Component({
  selector: 'app-order-edit-page',
  imports: [CommonModule, FormsModule, ToastComponent, SweetAlertModalComponent],
  templateUrl: './order-edit-page.component.html',
})
export default class OrderEditPageComponent {
  parseFloat = parseFloat; // expose it to the template
  OrderStatus = OrderStatus; // expose the enum to the template

  // Signals for order data
  clientName = signal('');
  clientEmail = signal('');
  totalPriceUsd = signal(0);
  totalPriceMxn = signal(0);
  shippingPriceMxn = signal(0);
  status = signal('new');
  createdAt = signal<Date>(new Date());
  orderId = signal('');
  currentExchange = signal(0.0);

  orderDetails = signal<OrderDetail[]>([]);
  productList = signal<Product[]>([]);

  // Signals for loading state and error messages
  successMessage = signal('');
  errorMessage = signal('');

  selectedProducts = signal<string[]>([]);
  orderStatusList = signal<string[]>([]);

  exchangeRateService = inject(ExchangeRateService);
  private orderService = inject(OrdersService);
  private productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild(ToastComponent) toast!: ToastComponent;
  @ViewChild(SweetAlertModalComponent) modal!: SweetAlertModalComponent;

  constructor() {
    // ✅ Clear messages when a field changes
    effect(() => {
      // Listen for changes in any form field
      this.clientName();
      this.clientEmail();
      this.shippingPriceMxn();

      // Clear messages when a field changes
      this.successMessage.set('');
      this.errorMessage.set('');
    });

  }


  ngOnInit() {

    const statusList: string[] = []
    Object.keys(OrderStatus).forEach((key) => {
      statusList.push(key.toLocaleLowerCase());
    })
    this.orderStatusList.set(statusList);

    //Fetch current exchange rate
    this.exchangeRateService.fetchUsdToMxnRate();

    //Get order data
    const id = this.route.snapshot.paramMap.get('id');

    this.loadOrderData(id ?? '');
    this.loadProducts();
    this.orderId.set(id ?? '');

  }

  updateExchangeRate() {
    this.exchangeRateService.fetchUsdToMxnRate();
  }

  async loadProducts() {
    const { data, error } = await this.productsService.getProducts();
    if (error) {
      console.error('Error loading products:', error);
    } else {
      // Update the signal with new data
      this.productList.set(data);
    }
  }

  async loadOrderData(id: string) {
    try {
      const { data, error } = await this.orderService.loadOrder(id);


      if (error || !data) {
        console.error('Failed to load order:', error);
        this.router.navigate(['/orders']);
        return;
      }

      // Set signals
      this.clientName.set(data.clientName);
      this.clientEmail.set(data.clientEmail ?? '');
      this.totalPriceUsd.set(data.totalPriceUsd);
      this.totalPriceMxn.set(data.totalPriceMxn);
      this.shippingPriceMxn.set(data.shippingPriceMxn);
      this.status.set(data.status);
      this.createdAt.set(new Date(data.createdAt));
      this.currentExchange.set(data.currentExchange ?? 0);
      this.orderDetails.set(data.products ?? []);

    } catch (err) {
      console.error('Unexpected error loading order:', err);
      this.router.navigate(['/orders']);
    }

  }

  goBackToOrderList() {
    this.router.navigate(['/orders']);
  }

  onOrderButtonClicked(){
    this.modal.showQuestionAlert({
      title: '¿Estás seguro?',
      text: '¿Quieres enviar la orden?',
      icon: 'info',
      confirmText: 'Sí',
      denyText: 'No',
      acceptFunction: () => {
        this.updateOrder(OrderStatus.REQUESTED);
      },
      denyFunction: () => {}
    });
  }

  onCancelButtonClicked(){
    this.modal.showQuestionAlert({
      title: '¿Estás seguro?',
      text: '¿Quieres cancelar la orden?',
      icon: 'warning',
      confirmText: 'Sí',
      denyText: 'No',
      acceptFunction: () => {
        this.updateOrder(OrderStatus.CANCELLED);
      },
      denyFunction: () => {}
    });
  }



  getSelectedProductName(detailId: string): string {
    const detail = this.orderDetails().find(d => d.detailId === detailId);
    const product = this.productList().find(p => p.id === detail?.productId);
    return product ? product.name : 'Selecciona un producto';
  }

  updateOrderAsCurrentState(){
    const currentStatus: OrderStatus = OrderStatus[this.status().toLocaleUpperCase() as keyof typeof OrderStatus];
    this.updateOrder(currentStatus);
  }

  async updateOrder(status: OrderStatus) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('No se encontró el ID de la orden.');
      this.successMessage.set('');
      return;
    }

    const total = this.getOrderTotal();

    this.totalPriceMxn.set(total);

    let changes:Partial<Order> | null = null;
    if(status==OrderStatus.REQUESTED){
      changes= {
        clientName: this.clientName(),
        clientEmail: this.clientEmail(),
        shippingPriceMxn: this.shippingPriceMxn(),
        totalPriceMxn: total,
        status: status,
        currentExchange: this.exchangeRateService.usdToMxnRate(),
      };
    }else {
       changes= {
        clientName: this.clientName(),
        clientEmail: this.clientEmail(),
        shippingPriceMxn: this.shippingPriceMxn(),
        totalPriceMxn: total,
        status: status,
      };
    }


    const { error } = await this.orderService.updateOrder(id, changes);

    if (error) {
      console.error('Failed to update order:', error);
      this.errorMessage.set('Error al actualizar la orden. Intenta nuevamente.');
      this.successMessage.set('');
      return;
    }

    this.successMessage.set('Orden actualizada exitosamente. Hora:' + new Date().toLocaleTimeString());
    this.errorMessage.set('');

    this.loadOrderData(id);
  }

  addOrderDetail() {
    const current = this.orderDetails();
    const newDetail: OrderDetail = {
      detailId: crypto.randomUUID(), // unique ID for tracking
      orderId: this.orderId(),       // current order ID
      productId: '',                 // default empty values
      quantity: 1,
      priceUsd: 0,
      priceMxn: 0,
      discountUsd: 0,
      discountMxn: 0,
      taxUsd: 0,
      taxMxn: 0,
      earningsMxn: 0,
      subtotalMxn: 0
    };

    this.orderDetails.set([...current, newDetail]);
  }


  async saveOrderDetails() {
    const currentStatus: OrderStatus = OrderStatus[this.status() as keyof typeof OrderStatus];
    this.updateOrder(currentStatus);
    const id = this.orderId();
    if (!id) {
      this.toast.show('No se encontró el ID de la orden.');
      return;
    }

    const { error } = await this.orderService.saveDetailsToOrder(id, this.orderDetails());

    if (error) {
      console.error('Error al guardar detalles:', error);
      this.toast.show('Error al guardar los Productos de la orden.');
    } else {
      this.toast.show('Productos guardados exitosamente.');
    }
  }

  removeOrderDetail(detailId: string) {
    const currentDetails = this.orderDetails();
    const updatedDetails = currentDetails.filter(detail => detail.detailId !== detailId);
    this.orderDetails.set(updatedDetails);
  }

  getOrderTotal(): number {
    let total = 0;
    for (const detail of this.orderDetails()) {
      total += this.getOrderSubtotal(detail);
    }
    total += this.shippingPriceMxn();
    return total;
  }

  getOrderSubtotal(detail: OrderDetail): number {
    return (detail.quantity) * ((detail.priceUsd - detail.discountUsd) * this.exchangeRateService.usdToMxnRate() + detail.earningsMxn)
  }

  canAddProducts():boolean {
    if(this.status()== OrderStatus.NEW){
      return true;
    }
    return false;
  }

  canUpdateOrder():boolean {
    if(this.status()== OrderStatus.NEW || this.status()== OrderStatus.REQUESTED|| this.status()== OrderStatus.PAID){
      return true;
    }
    return false;
  }

  getCurrentExchangeRate():number {
    if(this.status()== OrderStatus.NEW){
      return this.exchangeRateService.usdToMxnRate();
    }else {
      return this.currentExchange();
    }

  }


}
