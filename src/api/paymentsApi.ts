import apiClient from './apiClient';
import type { Payment, MarkFailedRequest, MarkRefundedRequest } from '../types/payment';

export interface PaymentFilters {
  status?: string;
  appointmentId?: number;
  take?: number;
}

export const getPayments = (filters?: PaymentFilters) =>
  apiClient.get<Payment[]>('/api/admin/payments', { params: filters });

export const getPaymentById = (id: number) =>
  apiClient.get<Payment>(`/api/admin/payments/${id}`);

export const markPaymentPaid = (id: number) =>
  apiClient.patch<Payment>(`/api/admin/payments/${id}/mark-paid`);

export const markPaymentFailed = (id: number, data: MarkFailedRequest) =>
  apiClient.patch<Payment>(`/api/admin/payments/${id}/mark-failed`, data);

export const markPaymentRefunded = (id: number, data: MarkRefundedRequest) =>
  apiClient.patch<Payment>(`/api/admin/payments/${id}/mark-refunded`, data);
