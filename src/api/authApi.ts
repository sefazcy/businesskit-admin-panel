import apiClient from './apiClient';
import { LoginRequest, LoginResponse } from '../types/auth';

export const login = (data: LoginRequest) =>
  apiClient.post<LoginResponse>('/api/auth/login', data);
