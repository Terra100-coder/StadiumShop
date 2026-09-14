import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

type ProductStatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);

  products: Product[] = [];
  searchTerm = '';
  statusFilter: ProductStatusFilter = 'all';
  isLoading = true;
  errorMessage = '';
  failedImageIds = new Set<number>();

  ngOnInit(): void {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const normalizedSearch = this.searchTerm.trim().toLocaleLowerCase();

    return this.products.filter((product) => {
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && product.active) ||
        (this.statusFilter === 'inactive' && !product.active);
      const matchesSearch = !normalizedSearch || [product.name, product.teamName, product.categoryName]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.failedImageIds.clear();
        this.isLoading = false;
      },
      error: () => {
        this.products = [];
        this.errorMessage = 'Impossible de charger les produits.';
        this.isLoading = false;
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  setStatusFilter(filter: ProductStatusFilter): void {
    this.statusFilter = filter;
  }

  getStockQuantity(product: Product): number {
    return product.stock.reduce((total, stock) => total + Math.max(stock.quantity ?? 0, 0), 0);
  }

  hasImageFailed(product: Product): boolean {
    return this.failedImageIds.has(product.id);
  }

  onImageError(product: Product): void {
    this.failedImageIds.add(product.id);
  }
}
