export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  category_id: number;
  category: Category;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginatedMeta;
}
