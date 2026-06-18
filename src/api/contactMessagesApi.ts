import apiClient from './apiClient';
import type { ContactMessage } from '../types/contactMessage';

export interface MessageFilters {
  unreadOnly?: boolean;
  archivedOnly?: boolean;
}

export const getAllMessages = (filters?: MessageFilters) => {
  const params: Record<string, boolean> = {};
  if (filters?.unreadOnly === true) params.unreadOnly = true;
  if (filters?.archivedOnly === true) params.archivedOnly = true;
  return apiClient.get<ContactMessage[]>('/api/admin/contact-messages', { params });
};

export const getMessageById = (id: number) =>
  apiClient.get<ContactMessage>(`/api/admin/contact-messages/${id}`);

export const markRead = (id: number) =>
  apiClient.patch<ContactMessage>(`/api/admin/contact-messages/${id}/mark-read`);

export const markUnread = (id: number) =>
  apiClient.patch<ContactMessage>(`/api/admin/contact-messages/${id}/mark-unread`);

export const markReplied = (id: number) =>
  apiClient.patch<ContactMessage>(`/api/admin/contact-messages/${id}/mark-replied`);

export const archiveMessage = (id: number) =>
  apiClient.patch<ContactMessage>(`/api/admin/contact-messages/${id}/archive`);

export const unarchiveMessage = (id: number) =>
  apiClient.patch<ContactMessage>(`/api/admin/contact-messages/${id}/unarchive`);
