export interface BusinessSettings {
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsApp: string | null;
  instagram: string | null;
  linkedIn: string | null;
  facebook: string | null;
  twitter: string | null;
  website: string | null;
  workingHours: string | null;
  currency: string;
  themeColor: string | null;
  updatedAt: string;
}

export interface UpdateBusinessSettingsRequest {
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsApp: string | null;
  instagram: string | null;
  linkedIn: string | null;
  facebook: string | null;
  twitter: string | null;
  website: string | null;
  workingHours: string | null;
  currency: string;
  themeColor: string | null;
}
