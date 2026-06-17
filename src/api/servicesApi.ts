import apiClient from './apiClient';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../types/service';

export const getAllServices = () =>
  apiClient.get<Service[]>('/api/admin/services');

export const getServiceById = (id: number) =>
  apiClient.get<Service>(`/api/admin/services/${id}`);

export const createService = (data: CreateServiceRequest) =>
  apiClient.post<Service>('/api/admin/services', data);

export const updateService = (id: number, data: UpdateServiceRequest) =>
  apiClient.put<Service>(`/api/admin/services/${id}`, data);

export const toggleServiceActive = (id: number) =>
  apiClient.patch<Service>(`/api/admin/services/${id}/toggle-active`);
