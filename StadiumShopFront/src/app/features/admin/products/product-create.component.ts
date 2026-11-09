import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Category, CreateProductRequest, Team } from '../../../core/models/product.model';
import { AdminProductService } from '../../../core/services/admin-product.service';

const urlPattern = /^https?:\/\/.+/i;
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const promoBelowPrice: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const price = Number(control.get('price')?.value);
  const promoPrice = control.get('promoPrice')?.value;

  return promoPrice !== null && promoPrice !== '' && Number(promoPrice) >= price
    ? { promoNotBelowPrice: true }
    : null;
};

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminProductService = inject(AdminProductService);
  private readonly router = inject(Router);

  readonly sizes = sizes;
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    price: [null, [Validators.required, Validators.min(0.0000001)]],
    promoPrice: [null, [Validators.min(0.0000001)]],
    mainImage: ['', [Validators.required, Validators.pattern(urlPattern)]],
    gallery: this.fb.array([]),
    categoryId: [null, Validators.required],
    teamId: [null, Validators.required],
    personalizable: [false],
    active: [true],
    stock: this.fb.array(sizes.map((size) => this.fb.group({
      size: [size],
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    }))),
  }, { validators: promoBelowPrice });

  categories: Category[] = [];
  teams: Team[] = [];
  isLoadingOptions = true;
  optionsErrorMessage = '';
  isSubmitting = false;
  submitErrorMessage = '';

  get gallery(): FormArray {
    return this.form.controls.gallery;
  }

  get stock(): FormArray {
    return this.form.controls.stock;
  }

  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions(): void {
    this.isLoadingOptions = true;
    this.optionsErrorMessage = '';

    forkJoin({
      categories: this.adminProductService.getCategories(),
      teams: this.adminProductService.getTeams(),
    }).subscribe({
      next: ({ categories, teams }) => {
        this.categories = categories;
        this.teams = teams;
        this.isLoadingOptions = false;
      },
      error: () => {
        this.categories = [];
        this.teams = [];
        this.optionsErrorMessage = 'Impossible de charger les catégories et les équipes. Réessayez avant d’enregistrer le produit.';
        this.isLoadingOptions = false;
      },
    });
  }

  addGalleryImage(): void {
    this.gallery.push(this.fb.control('', [Validators.required, Validators.pattern(urlPattern)]));
  }

  removeGalleryImage(index: number): void {
    this.gallery.removeAt(index);
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid || this.isLoadingOptions || this.optionsErrorMessage) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const stock = value.stock
      .map((item) => ({ size: item.size ?? '', quantity: Number(item.quantity) }))
      .filter((item, index, items) => item.size && items.findIndex((candidate) => candidate.size === item.size) === index);
    const request: CreateProductRequest = {
      name: value.name!.trim(),
      description: value.description?.trim() ?? '',
      price: Number(value.price),
      ...(value.promoPrice !== null && value.promoPrice !== '' ? { promoPrice: Number(value.promoPrice) } : {}),
      mainImage: value.mainImage!.trim(),
      gallery: (value.gallery as string[]).map((url) => url.trim()),
      personalizable: Boolean(value.personalizable),
      active: Boolean(value.active),
      categoryId: Number(value.categoryId),
      teamId: Number(value.teamId),
      stock,
    };

    this.isSubmitting = true;
    this.submitErrorMessage = '';
    this.adminProductService.createProduct(request).subscribe({
      next: () => void this.router.navigate(['/admin/products']),
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submitErrorMessage = this.getSubmitErrorMessage(error);
      },
    });
  }

  isInvalid(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private getSubmitErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.';
    if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
    if (error.status === 403) return 'Vous ne disposez pas des droits nécessaires pour créer un produit.';
    if (error.status === 400) return 'Certaines informations sont invalides. Vérifiez le formulaire puis réessayez.';
    return 'La création du produit a échoué. Réessayez dans quelques instants.';
  }
}
