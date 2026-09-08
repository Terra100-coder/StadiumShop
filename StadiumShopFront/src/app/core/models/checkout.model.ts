export interface CheckoutItem {
  productId: number;
  size: string;
  quantity: number;
  personalizationName: string | null;
  personalizationNumber: string | null;
}

export interface CheckoutRequest {
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  items: CheckoutItem[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface CheckoutResponse {
  orderId: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
