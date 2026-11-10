import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environment';
import { AdminOrder } from '../models/admin-order.model';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  constructor(private readonly http: HttpClient) {}

  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${environment.apiUrl}/admin/orders`);
  }
}
