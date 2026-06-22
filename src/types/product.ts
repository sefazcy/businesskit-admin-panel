export interface Product {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  isLowStock: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  notes: string | null;
}

export interface UpdateProductRequest {
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  notes: string | null;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
  take?: number;
}
