export interface Service {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  displayOrder: number;
}

export interface UpdateServiceRequest {
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}
