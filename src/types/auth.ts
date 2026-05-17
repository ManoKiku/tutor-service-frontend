export type UserRole = 'Student' | 'Tutor' | 'Admin' | number;

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl: string | null;
}

export  interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AvatarUploadRequest {
  avatar: File;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: number;
}

export interface DecodedToken {
  sub: string;
  jti: string;
  email: string;
  uid: string;
  unique_name: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}