import apiClient from './apiClient';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types/customer';

export interface CustomerFilters {
  name?: string;
  email?: string;
  phone?: string;
  includeArchived?: boolean;
}

export const getCustomers = (filters?: CustomerFilters) =>
  apiClient.get<Customer[]>('/api/admin/customers', { params: filters });

export const getCustomerById = (id: number) =>
  apiClient.get<Customer>(`/api/admin/customers/${id}`);

export const createCustomer = (data: CreateCustomerRequest) =>
  apiClient.post<Customer>('/api/admin/customers', data);

export const updateCustomer = (id: number, data: UpdateCustomerRequest) =>
  apiClient.put<Customer>(`/api/admin/customers/${id}`, data);

export const archiveCustomer = (id: number) =>
  apiClient.patch<Customer>(`/api/admin/customers/${id}/archive`);

export const unarchiveCustomer = (id: number) =>
  apiClient.patch<Customer>(`/api/admin/customers/${id}/unarchive`);
