import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product, ProductStockSize } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

export interface ProductCartPreparation {
  productId: number;
  size: string;
  quantity: number;
  personalizationName: string | null;
  personalizationNumber: string | null;
  price: number;
  image: string;
  name: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedImage = '';
  selectedSize: string | null = null;
  quantity = 1;
  personalizationEnabled = false;
  personalizationName = '';
  personalizationNumber = '';
  isLoading = true;
  errorMessage = '';
  imageHasFailed = false;

  private productId: number | null = null;

  @Output() addToCart = new EventEmitter<ProductCartPreparation>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = Number(params.get('id'));

      if (!Number.isSafeInteger(productId) || productId <= 0) {
        this.productId = null;
        this.product = null;
        this.isLoading = false;
        this.errorMessage = 'Ce produit est introuvable.';
        return;
      }

      this.productId = productId;
      this.loadProduct(productId);
    });
  }

  get galleryImages(): string[] {
    if (!this.product) {
      return [];
    }

    return [...new Set([this.product.mainImage, ...this.product.gallery].filter(Boolean))];
  }

  get selectedStock(): ProductStockSize | undefined {
    return this.product?.stock.find((stock) => stock.size === this.selectedSize);
  }

  get maxQuantity(): number {
    return this.availableQuantity(this.selectedStock);
  }

  get hasPromotion(): boolean {
    return this.product?.promoPrice !== null && this.product?.promoPrice !== undefined;
  }

  get canRetry(): boolean {
    return this.productId !== null;
  }

  get isPersonalizationValid(): boolean {
    if (!this.personalizationEnabled) {
      return true;
    }

    return this.personalizationName.trim().length > 0 && /^\d+$/.test(this.personalizationNumber.trim());
  }

  get canAddToCart(): boolean {
    return !!this.product &&
      this.product.active &&
      this.product.available &&
      this.maxQuantity > 0 &&
      this.quantity >= 1 &&
      this.quantity <= this.maxQuantity &&
      this.isPersonalizationValid;
  }

  selectImage(image: string): void {
    this.selectedImage = image;
    this.imageHasFailed = false;
  }

  selectSize(stock: ProductStockSize): void {
    if (this.availableQuantity(stock) === 0) {
      return;
    }

    this.selectedSize = stock.size;
    this.quantity = 1;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
    }
  }

  updateQuantity(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    if (!Number.isInteger(value)) {
      this.quantity = 0;
      return;
    }

    this.quantity = Math.min(Math.max(value, 1), this.maxQuantity);
  }

  updatePersonalizationName(event: Event): void {
    this.personalizationName = (event.target as HTMLInputElement).value;
  }

  updatePersonalizationNumber(event: Event): void {
    this.personalizationNumber = (event.target as HTMLInputElement).value;
  }

  togglePersonalization(event: Event): void {
    this.personalizationEnabled = (event.target as HTMLInputElement).checked;
  }

  retry(): void {
    if (this.productId !== null) {
      this.loadProduct(this.productId);
    }
  }

  prepareAddToCart(): void {
    if (!this.product || !this.selectedSize || !this.canAddToCart) {
      return;
    }

    this.addToCart.emit({
      productId: this.product.id,
      size: this.selectedSize,
      quantity: this.quantity,
      personalizationName: this.personalizationEnabled ? this.personalizationName.trim() : null,
      personalizationNumber: this.personalizationEnabled ? this.personalizationNumber.trim() : null,
      price: this.product.promoPrice ?? this.product.price,
      image: this.product.mainImage,
      name: this.product.name,
    });
  }

  onImageError(): void {
    this.imageHasFailed = true;
  }

  private loadProduct(productId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.product = null;
    this.selectedSize = null;
    this.quantity = 1;

    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = this.galleryImages[0] ?? '';
        this.imageHasFailed = false;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger ce produit. Il est peut-être indisponible ou introuvable.';
        this.isLoading = false;
      },
    });
  }

  private availableQuantity(stock: ProductStockSize | undefined): number {
    return Math.max(stock?.quantity ?? 0, 0);
  }
}
