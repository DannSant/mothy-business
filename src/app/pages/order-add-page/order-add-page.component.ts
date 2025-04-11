import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-order-add-page',
  imports: [ToastComponent],
  templateUrl: './order-add-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrderAddPageComponent {
  clientName = signal('');
  clientEmail = signal('');
  showError = signal(false);

  private orderService = inject(OrdersService);
  private router = inject(Router);
  @ViewChild(ToastComponent) toast!: ToastComponent;

  async createOrder() {
    if (!this.clientName()) {
      this.showError.set(true);
      return;
    }

    this.showError.set(false);

    const order = {
      clientName: this.clientName(),
      clientEmail: this.clientEmail(),
    };

    const {data,error} = await this.orderService.addOrder(order);

    if (error) {
      console.error('Error creating order:', error);
      this.toast.show('Failed to create order.');
    } else {
      console.log('Order created successfully:', data);
      this.toast.show('Order created successfully!');
      this.clientName.set('');
      this.clientEmail.set('');
      setTimeout(() => this.router.navigate(['/orders/edit/',data?.id]), 3000);
    }

  }
}
