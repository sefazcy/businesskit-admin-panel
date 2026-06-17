export interface StaffMember {
  id: number;
  fullName: string;
  slug: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  linkedInUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffMemberRequest {
  fullName: string;
  slug: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  linkedInUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateStaffMemberRequest {
  fullName: string;
  slug: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  linkedInUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}
