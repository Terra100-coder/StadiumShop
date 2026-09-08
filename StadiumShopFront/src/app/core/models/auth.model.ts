export type UserRole = 'ADMIN' | 'CLIENT';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthenticatedUser {
  email: string;
  role: UserRole | null;
}
