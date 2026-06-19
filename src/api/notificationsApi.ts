import apiClient from './apiClient';
import type { Notification, NotificationSummary, NotificationFilters } from '../types/notification';

export const getNotifications = (filters?: NotificationFilters) => {
  const params: Record<string, string | number | boolean> = {};
  if (filters?.unreadOnly === true) params.unreadOnly = true;
  if (filters?.type) params.type = filters.type;
  if (filters?.take !== undefined) params.take = filters.take;
  return apiClient.get<Notification[]>('/api/admin/notifications', { params });
};

export const getUnreadNotificationCount = () =>
  apiClient.get<NotificationSummary>('/api/admin/notifications/unread-count');

export const markNotificationRead = (id: number) =>
  apiClient.patch<Notification>(`/api/admin/notifications/${id}/read`);

export const markNotificationUnread = (id: number) =>
  apiClient.patch<Notification>(`/api/admin/notifications/${id}/unread`);

export const markAllNotificationsRead = () =>
  apiClient.patch<{ markedCount: number }>('/api/admin/notifications/read-all');
