export interface ProductStockSize {
  size: string;
  quantity: number | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  promoPrice: number | null;
  mainImage: string;
  gallery: string[];
  personalizable: boolean;
  active: boolean;
  available: boolean;
  createdAt: string | null;
  categoryId: number;
  categoryName: string;
  teamId: number;
  teamName: string;
  stock: ProductStockSize[];
}
