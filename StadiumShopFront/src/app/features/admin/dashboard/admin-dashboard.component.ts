import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminDashboard } from '../../../core/models/admin-dashboard.model';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminDashboardService = inject(AdminDashboardService);

  dashboard: AdminDashboard | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminDashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.dashboard = null;
        this.errorMessage = error.status === 403
          ? 'Vous n’avez pas l’autorisation d’accéder aux données du tableau de bord.'
          : 'Impossible de charger les données du tableau de bord.';
        this.isLoading = false;
      },
    });
  }

  formatRevenue(value: number | null | undefined): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value ?? 0)} FCFA`;
  }
}
