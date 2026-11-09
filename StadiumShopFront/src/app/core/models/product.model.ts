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

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Team {
  id: number;
  name: string;
  type: 'CLUB' | 'NATIONAL_TEAM';
  country: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  mainImage: string;
  gallery: string[];
  personalizable: boolean;
  active: boolean;
  categoryId: number;
  teamId: number;
  stock: Array<{ size: string; quantity: number }>;
}
