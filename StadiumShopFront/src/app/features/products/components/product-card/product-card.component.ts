import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  private productValue!: Product;

  imageHasFailed = false;

  @Input({ required: true })
  set product(product: Product) {
    this.productValue = product;
    this.imageHasFailed = false;
  }

  get product(): Product {
    return this.productValue;
  }

  @Output() addToCart = new EventEmitter<Product>();

  get hasPromotion(): boolean {
    return this.product.promoPrice !== null;
  }

  get canBePurchased(): boolean {
    return this.product.active && this.product.available;
  }

  onImageError(): void {
    this.imageHasFailed = true;
  }

  requestAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}
