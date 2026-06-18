import apiClient from './apiClient';
import type { GalleryItem, CreateGalleryItemRequest, UpdateGalleryItemRequest, FileUploadResponse } from '../types/gallery';

export interface GalleryFilters {
  category?: string;
  isActive?: boolean;
}

export const getAllGalleryItems = (filters?: GalleryFilters) =>
  apiClient.get<GalleryItem[]>('/api/admin/gallery', { params: filters });

export const createGalleryItem = (data: CreateGalleryItemRequest) =>
  apiClient.post<GalleryItem>('/api/admin/gallery', data);

export const updateGalleryItem = (id: number, data: UpdateGalleryItemRequest) =>
  apiClient.put<GalleryItem>(`/api/admin/gallery/${id}`, data);

export const toggleGalleryItemActive = (id: number) =>
  apiClient.patch<GalleryItem>(`/api/admin/gallery/${id}/toggle-active`);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<FileUploadResponse>('/api/admin/uploads/image', formData);
};
