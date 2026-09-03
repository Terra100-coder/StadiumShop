export interface ProductStockSize {
  size: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  mainImage: string;
  active: boolean;
  personalizable: boolean;
  gallery: string[];
  available: boolean;
  categoryName: string;
  teamName: string;
  stockSizes: ProductStockSize[];
}
