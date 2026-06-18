import apiClient from './apiClient';
import type { BusinessSettings, UpdateBusinessSettingsRequest } from '../types/businessSettings';

export const getSettings = async (): Promise<BusinessSettings | null> => {
  try {
    const { data } = await apiClient.get<BusinessSettings>('/api/business-settings');
    return data;
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404) return null;
    }
    throw err;
  }
};

export const updateSettings = (data: UpdateBusinessSettingsRequest) =>
  apiClient.put<BusinessSettings>('/api/admin/business-settings', data);
