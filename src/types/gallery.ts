export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryItemRequest {
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  displayOrder: number;
}

export interface UpdateGalleryItemRequest {
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface FileUploadResponse {
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  url: string;
}
