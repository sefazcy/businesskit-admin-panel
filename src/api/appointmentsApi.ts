import apiClient from './apiClient';
import type { Appointment } from '../types/appointment';

export interface AppointmentFilters {
  status?: string;
  date?: string;
}

export const getAppointments = (filters?: AppointmentFilters) =>
  apiClient.get<Appointment[]>('/api/admin/appointments', { params: filters });
