export interface Customer {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export interface UpdateCustomerRequest {
  fullName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}
