import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductCreateComponent } from './product-create.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductEditComponent extends ProductCreateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private productId: number | null = null;

  override ngOnInit(): void {
    this.isEditMode = true;
    this.loadOptions();
  }

  protected override loadOptions(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.optionsErrorMessage = 'Le produit demandé est introuvable.';
      this.isLoadingOptions = false;
      return;
    }

    this.productId = id;
    this.isLoadingOptions = true;
    this.optionsErrorMessage = '';
    forkJoin({
      product: this.productService.getProduct(id),
      categories: this.adminProductService.getCategories(),
      teams: this.adminProductService.getTeams(),
    }).subscribe({
      next: ({ product, categories, teams }) => {
        this.categories = categories;
        this.teams = teams;
        this.populateForm(product);
        this.isLoadingOptions = false;
      },
      error: (error: HttpErrorResponse) => {
        this.optionsErrorMessage = error.status === 404
          ? 'Le produit demandé est introuvable.'
          : 'Impossible de charger le produit, les catégories ou les équipes. Réessayez avant d’enregistrer.';
        this.isLoadingOptions = false;
      },
    });
  }

  override submit(): void {
    if (this.isSubmitting || this.productId === null) {
      return;
    }

    if (this.form.invalid || this.isLoadingOptions || this.optionsErrorMessage) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitErrorMessage = '';
    this.adminProductService.updateProduct(this.productId, this.buildRequest()).subscribe({
      next: () => void this.router.navigate(['/admin/products']),
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submitErrorMessage = this.getSubmitErrorMessage(error).replace('créer un produit', 'modifier le produit');
      },
    });
  }

  private populateForm(product: Product): void {
    this.form.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      promoPrice: product.promoPrice,
      mainImage: product.mainImage,
      categoryId: product.categoryId,
      teamId: product.teamId,
      personalizable: product.personalizable,
      active: product.active,
    });

    this.gallery.clear();
    product.gallery.forEach((image) => this.gallery.push(this.fb.control(image, this.form.controls.mainImage.validator)));

    this.stock.clear();
    const seenSizes = new Set<string>();
    product.stock.forEach((item) => {
      if (!seenSizes.has(item.size)) {
        seenSizes.add(item.size);
        this.stock.push(this.fb.group({
          size: [item.size],
          quantity: [item.quantity ?? 0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
        }));
      }
    });
  }
}
