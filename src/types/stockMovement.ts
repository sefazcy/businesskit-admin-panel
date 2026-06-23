export type StockMovementType = 'In' | 'Out' | 'Adjustment';

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateStockMovementRequest {
  productId: number;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  notes: string | null;
}

export interface StockMovementFilters {
  productId?: number;
  type?: StockMovementType;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
}

export interface StockSummary {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  isLowStock: boolean;
  totalIn: number;
  totalOut: number;
  adjustmentCount: number;
  lastMovementAt: string | null;
}
