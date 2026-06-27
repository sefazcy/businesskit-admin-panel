import apiClient from './apiClient';
import type {
  ApartmentUnit, CreateApartmentUnitRequest, UpdateApartmentUnitRequest, ApartmentUnitFilters,
  Resident, CreateResidentRequest, UpdateResidentRequest, ResidentFilters,
} from '../types/apartment';

export const getApartmentUnits = (filters?: ApartmentUnitFilters) =>
  apiClient.get<ApartmentUnit[]>('/api/admin/apartment-units', { params: filters });

export const getApartmentUnit = (id: number) =>
  apiClient.get<ApartmentUnit>(`/api/admin/apartment-units/${id}`);

export const createApartmentUnit = (data: CreateApartmentUnitRequest) =>
  apiClient.post<ApartmentUnit>('/api/admin/apartment-units', data);

export const updateApartmentUnit = (id: number, data: UpdateApartmentUnitRequest) =>
  apiClient.put<ApartmentUnit>(`/api/admin/apartment-units/${id}`, data);

export const toggleApartmentUnitActive = (id: number) =>
  apiClient.patch<ApartmentUnit>(`/api/admin/apartment-units/${id}/toggle-active`);

export const getApartmentUnitResidents = (id: number) =>
  apiClient.get<Resident[]>(`/api/admin/apartment-units/${id}/residents`);

export const getResidents = (filters?: ResidentFilters) =>
  apiClient.get<Resident[]>('/api/admin/residents', { params: filters });

export const getResident = (id: number) =>
  apiClient.get<Resident>(`/api/admin/residents/${id}`);

export const createResident = (data: CreateResidentRequest) =>
  apiClient.post<Resident>('/api/admin/residents', data);

export const updateResident = (id: number, data: UpdateResidentRequest) =>
  apiClient.put<Resident>(`/api/admin/residents/${id}`, data);

export const toggleResidentActive = (id: number) =>
  apiClient.patch<Resident>(`/api/admin/residents/${id}/toggle-active`);
