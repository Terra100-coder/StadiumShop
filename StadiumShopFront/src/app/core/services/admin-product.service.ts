import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environment';
import { Category, CreateProductRequest, Product, ProductStockSize, Team } from '../models/product.model';

export interface StockUpdateRequest {
  size: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  constructor(private readonly http: HttpClient) {}

  activateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${environment.apiUrl}/admin/products/${id}/activate`, {});
  }

  deactivateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${environment.apiUrl}/admin/products/${id}/deactivate`, {});
  }

  updateStock(id: number, request: StockUpdateRequest): Observable<ProductStockSize> {
    return this.http.patch<ProductStockSize>(`${environment.apiUrl}/admin/products/${id}/stock`, request);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.apiUrl}/teams`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/admin/products`, request);
  }
}
