export interface CartItem {
  productId: number;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  personalizationName: string | null;
  personalizationNumber: string | null;
  maxQuantity: number;
}
