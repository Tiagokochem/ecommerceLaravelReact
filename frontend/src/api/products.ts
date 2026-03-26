import { api } from './client';
import type { PaginatedProducts, Product } from '../types';

export async function fetchProducts(params: {
  page?: number;
  perPage?: number;
  categoryId?: number | '';
  search?: string;
}): Promise<PaginatedProducts> {
  const { page = 1, perPage = 12, categoryId, search } = params;

  const { data } = await api.get<PaginatedProducts>('/api/products', {
    params: {
      page,
      per_page: perPage,
      ...(categoryId !== '' && categoryId !== undefined ? { category: categoryId } : {}),
      ...(search?.trim() ? { search: search.trim() } : {}),
    },
  });

  return data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await api.get<{ data: Product }>(`/api/products/${id}`);
  return data.data;
}

export async function createProduct(payload: {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string | null;
}): Promise<Product> {
  const { data } = await api.post<{ data: Product }>('/api/products', payload);
  return data.data;
}
