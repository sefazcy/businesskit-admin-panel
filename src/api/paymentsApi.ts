import apiClient from './apiClient';
import type { Payment, MarkFailedRequest, MarkRefundedRequest, CreatePaymentRequest, PaymentSummaryStats } from '../types/payment';

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

export const getAppointmentPayments = (appointmentId: number) =>
  apiClient.get<Payment[]>(`/api/admin/appointments/${appointmentId}/payments`);

export const createAppointmentPayment = (appointmentId: number, data: CreatePaymentRequest) =>
  apiClient.post<Payment>(`/api/admin/appointments/${appointmentId}/payments`, data);

export const getPaymentSummary = (fromDate?: string, toDate?: string) => {
  const params: Record<string, string> = {};
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  return apiClient.get<PaymentSummaryStats>('/api/admin/payments/summary', {
    params: Object.keys(params).length ? params : undefined,
  });
};
