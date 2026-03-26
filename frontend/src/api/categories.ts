import { api } from './client';
import type { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<{ data: Category[] }>('/api/categories');
  return data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<{ data: Category }>('/api/categories', { name });
  return data.data;
}
