import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router } from '@angular/router';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { OrdersService } from '../../services/orders.service';
@Component({
  selector: 'app-order-edit-page',
  imports: [CommonModule],
  templateUrl: './order-edit-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderEditPageComponent {
  parseFloat = parseFloat; // expose it to the template

  clientName = signal('');
  clientEmail = signal('');
  totalPriceUsd = signal(0);
  totalPriceMxn = signal(0);
  shippingPriceMxn = signal(0);
  status = signal('new');
  createdAt = signal<Date>(new Date());

  exchangeRateService = inject(ExchangeRateService);
  private orderService = inject(OrdersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    //Fetch current exchange rate
    this.exchangeRateService.fetchUsdToMxnRate();

    //Get order data
    const id = this.route.snapshot.paramMap.get('id');
    this.loadOrderData(id ?? '');
  }

  updateExchangeRate(){
    this.exchangeRateService.fetchUsdToMxnRate();
    console.log(this.exchangeRateService.usdToMxnRate())
  }

  async loadOrderData(id:string){
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
    } catch (err) {
      console.error('Unexpected error loading order:', err);
      this.router.navigate(['/orders']);
    }

  }

  goBackToOrderList(){
    this.router.navigate(['/orders']);
  }

  updateOrder(){

  }
}
