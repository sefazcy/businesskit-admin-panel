import apiClient from './apiClient';
import type { Appointment, AppointmentStats, UpdateStatusRequest, UpdateAppointmentRequest } from '../types/appointment';

export interface AppointmentFilters {
  status?: string;
  staffMemberId?: number;
  businessServiceId?: number;
  date?: string;
}

export const getAppointments = (filters?: AppointmentFilters) =>
  apiClient.get<Appointment[]>('/api/admin/appointments', { params: filters });

export const getAppointmentStats = () =>
  apiClient.get<AppointmentStats>('/api/admin/appointments/stats');

export const updateAppointmentStatus = (id: number, data: UpdateStatusRequest) =>
  apiClient.patch<Appointment>(`/api/admin/appointments/${id}/status`, data);

export const updateAppointment = (id: number, data: UpdateAppointmentRequest) =>
  apiClient.put<Appointment>(`/api/admin/appointments/${id}`, data);
