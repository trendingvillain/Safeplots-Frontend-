// Auth Service - Handles all authentication API calls (API mode only)
import { apiClient, API_ENDPOINTS, ApiResponse } from '@/lib/apiClient';
import { User } from '@/contexts/AuthContext';

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface GoogleLoginData {
  idToken: string;
  email: string;
  name: string;
  photoURL?: string;
  uid: string;
}

// Login with email and password
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
}

// Register new user
export async function register(data: RegisterData): Promise<ApiResponse<{ requiresOtp: boolean; email: string }>> {
  return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
}

// Verify OTP
export async function verifyOtp(email: string, otp: string): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
}

// Resend OTP
export async function resendOtp(email: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { email });
}

// Google login
export async function googleLogin(data: GoogleLoginData): Promise<ApiResponse<LoginResponse & { isNewUser: boolean }>> {
  return apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
}

// Complete Google registration (for new users)
export async function googleRegister(data: { name: string; email: string; phone: string; firebaseUid: string }): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_REGISTER, data);
}

// Forgot password - sends OTP to email
export async function forgotPassword(email: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

// Reset password using OTP
export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
}

// Change password
export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
}

// Update user profile
export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
  return apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
}