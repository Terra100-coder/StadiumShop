import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminOrder } from '../../../core/models/admin-order.model';
import { OrderStatus } from '../../../core/models/checkout.model';
import { AdminOrderService } from '../../../core/services/admin-order.service';

const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELED'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminOrderService = inject(AdminOrderService);

  orders: AdminOrder[] = [];
  searchTerm = '';
  selectedStatus: OrderStatus | 'all' = 'all';
  isLoading = true;
  errorMessage = '';
  readonly statuses = orderStatuses;

  ngOnInit(): void {
    this.loadOrders();
  }

  get filteredOrders(): AdminOrder[] {
    const searchTerm = this.searchTerm.trim();

    return this.orders
      .filter((order) => (this.selectedStatus === 'all' || order.status === this.selectedStatus) &&
        (!searchTerm || String(order.orderId).includes(searchTerm)))
      .sort((first, second) => this.toTimestamp(second.createdAt) - this.toTimestamp(first.createdAt));
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminOrderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.orders = [];
        this.errorMessage = this.getLoadErrorMessage(error);
        this.isLoading = false;
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  setStatus(status: OrderStatus | 'all'): void {
    this.selectedStatus = status;
  }

  statusLabel(status: OrderStatus): string {
    return {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PREPARING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELED: 'Annulée',
    }[status];
  }

  formatAmount(amount: number): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} FCFA`;
  }

  private toTimestamp(date: string): number {
    const timestamp = Date.parse(date);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private getLoadErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
    if (error.status === 403) return 'Vous ne disposez pas des droits nécessaires pour consulter les commandes.';
    if (error.status === 0) return 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.';
    return 'Impossible de charger les commandes pour le moment. Réessayez dans quelques instants.';
  }
}
