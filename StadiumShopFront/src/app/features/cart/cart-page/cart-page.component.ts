import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartItem } from '../../../core/models/cart-item.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent {
  readonly cart = inject(CartService);
  feedbackMessage = '';

  decreaseQuantity(item: CartItem): void {
    this.cart.updateQuantity(item, item.quantity - 1);
    this.feedbackMessage = 'Quantité mise à jour.';
  }

  increaseQuantity(item: CartItem): void {
    this.cart.updateQuantity(item, item.quantity + 1);
    this.feedbackMessage = 'Quantité mise à jour.';
  }

  removeItem(item: CartItem): void {
    this.cart.removeItem(item);
    this.feedbackMessage = 'Article supprimé du panier.';
  }

  clearCart(): void {
    this.cart.clearCart();
    this.feedbackMessage = 'Panier vidé.';
  }
}
