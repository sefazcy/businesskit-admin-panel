import apiClient from './apiClient';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../types/product';

export const getProducts = (filters?: ProductFilters) =>
  apiClient.get<Product[]>('/api/admin/products', { params: filters });

export const getProduct = (id: number) =>
  apiClient.get<Product>(`/api/admin/products/${id}`);

export const createProduct = (data: CreateProductRequest) =>
  apiClient.post<Product>('/api/admin/products', data);

export const updateProduct = (id: number, data: UpdateProductRequest) =>
  apiClient.put<Product>(`/api/admin/products/${id}`, data);

export const toggleProductActive = (id: number) =>
  apiClient.patch<Product>(`/api/admin/products/${id}/toggle-active`);

export const getProductCategories = () =>
  apiClient.get<string[]>('/api/admin/products/categories');
