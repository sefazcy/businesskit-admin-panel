import apiClient from './apiClient';
import type { StaffWorkingHour, CreateWorkingHourRequest, UpdateWorkingHourRequest } from '../types/workingHours';

export const getWorkingHoursByStaff = (staffMemberId: number) =>
  apiClient.get<StaffWorkingHour[]>(`/api/admin/staff/${staffMemberId}/working-hours`);

export const createWorkingHour = (data: CreateWorkingHourRequest) =>
  apiClient.post<StaffWorkingHour>('/api/admin/staff-working-hours', data);

export const updateWorkingHour = (id: number, data: UpdateWorkingHourRequest) =>
  apiClient.put<StaffWorkingHour>(`/api/admin/staff-working-hours/${id}`, data);
