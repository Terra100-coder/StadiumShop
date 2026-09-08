import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartItem } from '../../../core/models/cart-item.model';
import { CheckoutRequest, CheckoutResponse } from '../../../core/models/checkout.model';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
})
export class CheckoutPageComponent {
  readonly cart = inject(CartService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly checkoutForm = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+().\s-]{6,30}$/)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    city: ['', [Validators.required, Validators.maxLength(120)]],
  });

  isSubmitting = false;
  errorMessage = '';

  submit(): void {
    if (this.isSubmitting || this.cart.isEmpty()) {
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const request = this.toCheckoutRequest(this.cart.items());

    this.orderService.createOrder(request).subscribe({
      next: (response) => this.completeOrder(response),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isSubmitting = false;
      },
    });
  }

  isInvalid(controlName: 'customerName' | 'phone' | 'email' | 'address' | 'city'): boolean {
    const control = this.checkoutForm.controls[controlName];
    return control.invalid && control.touched;
  }

  private toCheckoutRequest(items: CartItem[]): CheckoutRequest {
    const formValue = this.checkoutForm.getRawValue();
    const email = formValue.email.trim();

    return {
      customerName: formValue.customerName.trim(),
      phone: formValue.phone.trim(),
      email: email || null,
      address: formValue.address.trim(),
      city: formValue.city.trim(),
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        personalizationName: item.personalizationName,
        personalizationNumber: item.personalizationNumber,
      })),
    };
  }

  private completeOrder(response: CheckoutResponse): void {
    this.cart.clearCart();
    void this.router.navigate(['/order-confirmation'], { state: { order: response } });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (this.isInsufficientStockError(error)) {
      return 'La disponibilité d’un ou plusieurs produits a changé. Vérifiez votre panier puis réessayez.';
    }

    if (error.status === 0) {
      return 'La commande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.';
    }

    if (error.status === 409 || error.status === 422) {
      return 'La disponibilité d’un ou plusieurs produits a changé. Vérifiez votre panier puis réessayez.';
    }

    if (error.status === 400) {
      return 'Certaines informations de votre commande sont invalides. Vérifiez le formulaire puis réessayez.';
    }

    return 'La commande n’a pas pu être créée pour le moment. Votre panier a été conservé.';
  }

  private isInsufficientStockError(error: HttpErrorResponse): boolean {
    const payload = typeof error.error === 'string'
      ? error.error
      : typeof error.error?.message === 'string'
        ? error.error.message
        : '';

    return payload.toLowerCase().includes('insufficient stock');
  }
}
