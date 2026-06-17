import apiClient from './apiClient';
import type { StaffMember, CreateStaffMemberRequest, UpdateStaffMemberRequest } from '../types/staff';

export const getAllStaff = () =>
  apiClient.get<StaffMember[]>('/api/admin/staff');

export const getStaffById = (id: number) =>
  apiClient.get<StaffMember>(`/api/admin/staff/${id}`);

export const createStaff = (data: CreateStaffMemberRequest) =>
  apiClient.post<StaffMember>('/api/admin/staff', data);

export const updateStaff = (id: number, data: UpdateStaffMemberRequest) =>
  apiClient.put<StaffMember>(`/api/admin/staff/${id}`, data);

export const toggleStaffActive = (id: number) =>
  apiClient.patch<StaffMember>(`/api/admin/staff/${id}/toggle-active`);
