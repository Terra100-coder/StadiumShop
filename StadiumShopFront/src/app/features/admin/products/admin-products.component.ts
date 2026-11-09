import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { AdminProductService, StockUpdateRequest } from '../../../core/services/admin-product.service';
import { ProductService } from '../../../core/services/product.service';

type ProductStatusFilter = 'all' | 'active' | 'inactive';
type StatusAction = 'activate' | 'deactivate';

interface StatusConfirmation {
  product: Product;
  action: StatusAction;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly adminProductService = inject(AdminProductService);

  products: Product[] = [];
  searchTerm = '';
  statusFilter: ProductStatusFilter = 'all';
  isLoading = true;
  errorMessage = '';
  failedImageIds = new Set<number>();
  actionFeedbackMessage = '';
  actionErrorMessage = '';
  statusConfirmation: StatusConfirmation | null = null;
  confirmationErrorMessage = '';
  pendingStatusProductId: number | null = null;
  stockProduct: Product | null = null;
  stockQuantities: Record<string, string> = {};
  initialStockQuantities: Record<string, number | null> = {};
  stockErrorMessage = '';
  isSavingStock = false;
  deleteConfirmation: Product | null = null;
  deleteErrorMessage = '';
  deletingProductId: number | null = null;
  deleteConflict = false;

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

  requestStatusChange(product: Product): void {
    this.actionFeedbackMessage = '';
    this.actionErrorMessage = '';
    this.confirmationErrorMessage = '';
    this.statusConfirmation = {
      product,
      action: product.active ? 'deactivate' : 'activate',
    };
  }

  closeStatusConfirmation(): void {
    if (!this.pendingStatusProductId) {
      this.statusConfirmation = null;
      this.confirmationErrorMessage = '';
    }
  }

  confirmStatusChange(): void {
    const confirmation = this.statusConfirmation;

    if (!confirmation || this.pendingStatusProductId !== null) {
      return;
    }

    this.pendingStatusProductId = confirmation.product.id;
    this.confirmationErrorMessage = '';
    const request = confirmation.action === 'activate'
      ? this.adminProductService.activateProduct(confirmation.product.id)
      : this.adminProductService.deactivateProduct(confirmation.product.id);

    request.subscribe({
      next: () => {
        this.pendingStatusProductId = null;
        this.statusConfirmation = null;
        this.actionFeedbackMessage = `Le produit « ${confirmation.product.name} » a été ${confirmation.action === 'activate' ? 'activé' : 'désactivé'}.`;
        this.refreshProductsAfterAction();
      },
      error: (error: HttpErrorResponse) => {
        this.pendingStatusProductId = null;
        this.confirmationErrorMessage = this.getActionErrorMessage(error, 'modifier le statut du produit');
      },
    });
  }

  openStockModal(product: Product): void {
    this.actionFeedbackMessage = '';
    this.actionErrorMessage = '';
    this.stockErrorMessage = '';
    this.stockProduct = product;
    this.stockQuantities = {};
    this.initialStockQuantities = {};

    product.stock.forEach((stock) => {
      this.stockQuantities[stock.size] = stock.quantity === null ? '' : String(stock.quantity);
      this.initialStockQuantities[stock.size] = stock.quantity;
    });
  }

  closeStockModal(): void {
    if (!this.isSavingStock) {
      this.stockProduct = null;
      this.stockErrorMessage = '';
    }
  }

  requestDeletion(product: Product): void {
    if (this.deletingProductId !== null) {
      return;
    }

    this.actionFeedbackMessage = '';
    this.actionErrorMessage = '';
    this.deleteErrorMessage = '';
    this.deleteConflict = false;
    this.deleteConfirmation = product;
  }

  closeDeleteConfirmation(): void {
    if (this.deletingProductId === null) {
      this.deleteConfirmation = null;
      this.deleteErrorMessage = '';
      this.deleteConflict = false;
    }
  }

  confirmDeletion(): void {
    const product = this.deleteConfirmation;

    if (!product || this.deletingProductId !== null) {
      return;
    }

    this.deletingProductId = product.id;
    this.deleteErrorMessage = '';
    this.deleteConflict = false;
    this.adminProductService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingProductId = null;
        this.deleteConfirmation = null;
        this.actionFeedbackMessage = `Produit supprimé : ${product.name}.`;
        this.refreshProductsAfterAction();
      },
      error: (error: HttpErrorResponse) => {
        this.deletingProductId = null;
        this.deleteConflict = error.status === 409;
        this.deleteErrorMessage = this.getDeleteErrorMessage(error);
      },
    });
  }

  requestDeactivationAfterDeleteConflict(): void {
    const product = this.deleteConfirmation;

    if (!product || !product.active || this.deletingProductId !== null) {
      return;
    }

    this.closeDeleteConfirmation();
    this.requestStatusChange(product);
  }

  updateStockQuantity(size: string, event: Event): void {
    this.stockQuantities[size] = (event.target as HTMLInputElement).value;
  }

  get isStockFormValid(): boolean {
    return this.stockProduct !== null && this.stockProduct.stock.length > 0 &&
      this.stockProduct.stock.every((stock) => this.isValidStockQuantity(this.stockQuantities[stock.size]));
  }

  get hasStockChanges(): boolean {
    return this.stockProduct !== null && this.stockProduct.stock.some((stock) =>
      Number(this.stockQuantities[stock.size]) !== this.initialStockQuantities[stock.size]
    );
  }

  saveStock(): void {
    if (!this.stockProduct || !this.isStockFormValid || !this.hasStockChanges || this.isSavingStock) {
      return;
    }

    const product = this.stockProduct;
    const changes: StockUpdateRequest[] = product.stock
      .filter((stock) => Number(this.stockQuantities[stock.size]) !== this.initialStockQuantities[stock.size])
      .map((stock) => ({ size: stock.size, quantity: Number(this.stockQuantities[stock.size]) }));

    this.isSavingStock = true;
    this.stockErrorMessage = '';

    forkJoin(changes.map((change) => this.adminProductService.updateStock(product.id, change))).subscribe({
      next: () => {
        this.isSavingStock = false;
        this.stockProduct = null;
        this.actionFeedbackMessage = `Le stock de « ${product.name} » a été mis à jour.`;
        this.refreshProductsAfterAction();
      },
      error: (error: HttpErrorResponse) => {
        this.isSavingStock = false;
        this.stockErrorMessage = this.getActionErrorMessage(error, 'mettre à jour le stock');
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

  isStatusActionPending(product: Product): boolean {
    return this.pendingStatusProductId === product.id;
  }

  isDeletionPending(product: Product): boolean {
    return this.deletingProductId === product.id;
  }

  private refreshProductsAfterAction(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.failedImageIds.clear();
      },
      error: (error: HttpErrorResponse) => {
        this.actionErrorMessage = `${this.getActionErrorMessage(error, 'actualiser la liste')} Les informations affichées peuvent être obsolètes.`;
      },
    });
  }

  private isValidStockQuantity(value: string | undefined): boolean {
    if (value === undefined || !/^\d+$/.test(value.trim())) {
      return false;
    }

    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity >= 0;
  }

  private getDeleteErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Suppression impossible : verifiez votre connexion puis reessayez.';
    if (error.status === 401) return 'Suppression impossible : votre session a expire.';
    if (error.status === 403) return 'Suppression impossible : droits administrateur insuffisants.';
    if (error.status === 404) return 'Suppression impossible : le produit est introuvable.';
    if (error.status === 409) return 'Ce produit est lie a des commandes et ne peut pas etre supprime. Desactivez-le a la place.';
    return 'Suppression impossible pour le moment. Reessayez dans quelques instants.';
  }

  private getActionErrorMessage(error: HttpErrorResponse, action: string): string {
    if (error.status === 0) {
      return `Impossible de ${action} : vérifiez votre connexion puis réessayez.`;
    }

    if (error.status === 403) {
      return `Impossible de ${action} : vous ne disposez pas des droits administrateur.`;
    }

    if (error.status === 404) {
      return `Impossible de ${action} : ce produit est introuvable.`;
    }

    if (error.status === 401) {
      return `Impossible de ${action} : votre session a expiré.`;
    }

    return `Impossible de ${action} pour le moment. Réessayez dans quelques instants.`;
  }
}
