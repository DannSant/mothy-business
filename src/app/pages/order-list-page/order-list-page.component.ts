import {  Component, inject, signal } from '@angular/core';
import { Order } from '../../interfaces/order.interface';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-order-list-page',
  imports: [CommonModule,RouterLink],
  templateUrl: './order-list-page.component.html',
})
export default class OrderListPageComponent {
  orders = signal<Order[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  private orderService = inject(OrdersService);

  ngOnInit() {
    this.loadOrders();
  }

  private async loadOrders() {
    const { data, error } = await this.orderService.getOrders();

     if (error) {
       console.error('Error loading products:', error);
     } else {
       // Update the signal with new data
       this.orders.set(data);
     }
  }


 }
