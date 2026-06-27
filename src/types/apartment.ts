export type UnitType = 'Apartment' | 'Office' | 'Shop' | 'Other';
export type ResidentRole = 'Owner' | 'Tenant' | 'FamilyMember' | 'Other';

export interface ApartmentUnit {
  id: number;
  blockName: string;
  floorNumber: number;
  doorNumber: string;
  unitType: UnitType;
  grossArea: number | null;
  netArea: number | null;
  isOccupied: boolean;
  isActive: boolean;
  residentCount: number;
  primaryResidentName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApartmentUnitRequest {
  blockName: string;
  floorNumber: number;
  doorNumber: string;
  unitType: UnitType;
  grossArea: number | null;
  netArea: number | null;
  isOccupied: boolean;
  isActive: boolean;
  notes: string | null;
}

export interface UpdateApartmentUnitRequest {
  blockName: string;
  floorNumber: number;
  doorNumber: string;
  unitType: UnitType;
  grossArea: number | null;
  netArea: number | null;
  isOccupied: boolean;
  isActive: boolean;
  notes: string | null;
}

export interface ApartmentUnitFilters {
  search?: string;
  blockName?: string;
  unitType?: UnitType;
  isOccupied?: boolean;
  isActive?: boolean;
}

export interface Resident {
  id: number;
  apartmentUnitId: number;
  apartmentDoorNumber: string;
  apartmentBlockName: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: ResidentRole;
  isPrimary: boolean;
  isActive: boolean;
  moveInDate: string | null;
  moveOutDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResidentRequest {
  apartmentUnitId: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: ResidentRole;
  isPrimary: boolean;
  isActive: boolean;
  moveInDate: string | null;
  moveOutDate: string | null;
  notes: string | null;
}

export interface UpdateResidentRequest {
  fullName: string;
  phone: string | null;
  email: string | null;
  role: ResidentRole;
  isPrimary: boolean;
  isActive: boolean;
  moveInDate: string | null;
  moveOutDate: string | null;
  notes: string | null;
}

export interface ResidentFilters {
  search?: string;
  role?: ResidentRole;
  isActive?: boolean;
}
