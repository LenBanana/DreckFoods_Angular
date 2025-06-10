export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  currentWeight?: number;
  createdAt: string;
  role: AppRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  currentWeight?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ConfirmEmailRequest {
  userId: number;
  token: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

export enum AppRole {
  User = 0,
  DataEditor = 1,
  Admin = 2
}
