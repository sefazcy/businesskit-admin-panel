export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  isArchived: boolean;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
}
