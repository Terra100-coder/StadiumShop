import { OrderStatus } from './checkout.model';

export interface AdminOrder {
  orderId: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
