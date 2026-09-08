import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CheckoutResponse, OrderStatus } from '../../../core/models/checkout.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
})
export class OrderConfirmationComponent {
  readonly order: CheckoutResponse | null;

  constructor(private readonly router: Router) {
    const state = this.router.getCurrentNavigation()?.extras.state ?? history.state;
    this.order = this.isCheckoutResponse(state['order']) ? state['order'] : null;
  }

  private isCheckoutResponse(value: unknown): value is CheckoutResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const order = value as Partial<CheckoutResponse>;
    return typeof order.orderId === 'number' &&
      Number.isSafeInteger(order.orderId) &&
      typeof order.totalPrice === 'number' &&
      Number.isFinite(order.totalPrice) &&
      this.isOrderStatus(order.status) &&
      typeof order.createdAt === 'string';
  }

  private isOrderStatus(value: unknown): value is OrderStatus {
    return value === 'PENDING' || value === 'CONFIRMED' || value === 'PREPARING' ||
      value === 'SHIPPED' || value === 'DELIVERED' || value === 'CANCELED';
  }
}
