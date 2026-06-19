export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSummary {
  unreadCount: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: string;
  take?: number;
}
