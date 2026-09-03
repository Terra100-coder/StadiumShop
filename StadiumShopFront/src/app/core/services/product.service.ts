import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environment';
import { Product, ProductStockSize } from '../models/product.model';

interface ProductApiResponse extends Omit<Product, 'stockSizes'> {
  stock?: ProductStockSize[];
  stockSizes?: ProductStockSize[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<ProductApiResponse[]>(`${environment.apiUrl}/products`).pipe(
      map((products) =>
        products.map((product) => ({
          ...product,
          stockSizes: product.stockSizes ?? product.stock ?? [],
        }))
      )
    );
  }
}
