import apiClient from './apiClient';
import type {
  StockMovement,
  CreateStockMovementRequest,
  StockMovementFilters,
  StockSummary,
} from '../types/stockMovement';

export const getStockMovements = (filters?: StockMovementFilters) =>
  apiClient.get<StockMovement[]>('/api/admin/stock-movements', { params: filters });

export const createStockMovement = (data: CreateStockMovementRequest) =>
  apiClient.post<StockMovement>('/api/admin/stock-movements', data);

export const getProductStockMovements = (productId: number) =>
  apiClient.get<StockMovement[]>(`/api/admin/products/${productId}/stock-movements`);

export const getProductStockSummary = (productId: number) =>
  apiClient.get<StockSummary>(`/api/admin/products/${productId}/stock-summary`);
