import apiClient from './apiClient';
import type { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '../types/blog';

export interface BlogPostFilters {
  language?: string;
  category?: string;
  isPublished?: boolean;
}

export const getAllBlogPosts = (filters?: BlogPostFilters) =>
  apiClient.get<BlogPost[]>('/api/admin/blog', { params: filters });

export const createBlogPost = (data: CreateBlogPostRequest) =>
  apiClient.post<BlogPost>('/api/admin/blog', data);

export const updateBlogPost = (id: number, data: UpdateBlogPostRequest) =>
  apiClient.put<BlogPost>(`/api/admin/blog/${id}`, data);

export const publishBlogPost = (id: number) =>
  apiClient.patch<BlogPost>(`/api/admin/blog/${id}/publish`);

export const unpublishBlogPost = (id: number) =>
  apiClient.patch<BlogPost>(`/api/admin/blog/${id}/unpublish`);
