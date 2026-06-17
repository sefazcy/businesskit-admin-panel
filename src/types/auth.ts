export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: string;
}

export interface CurrentUser {
  email: string;
  fullName: string;
  roles: string[];
}
