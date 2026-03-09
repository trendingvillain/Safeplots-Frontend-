import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '@/services/authService';

/* ================= TYPES ================= */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'user' | 'seller' | 'admin';
  isVerified?: boolean;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;

  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  updateUserRole: (role: 'user' | 'seller' | 'admin') => void; // ⭐ NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ===== LOAD USER FROM LOCAL STORAGE ===== */

  useEffect(() => {
    const storedUser = localStorage.getItem('safeplots_user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('safeplots_user');
      }
    }

    setIsLoading(false);
  }, []);

  /* ================= LOGIN ================= */

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid credentials');
      }

      const userData = {
        ...response.data.user,
        token: response.data.token
      };

      setUser(userData);
      localStorage.setItem('safeplots_user', JSON.stringify(userData));

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safeplots_user');
  };

  /* ================= REGISTER ================= */

  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => {

    setIsLoading(true);

    try {
      const response = await authService.register({
        email,
        password,
        name,
        phone
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      console.log('[DEV] OTP sent to:', email);

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */

  const verifyOtp = async (email: string, otp: string) => {

    setIsLoading(true);

    try {

      const response = await authService.verifyOtp(email, otp);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid OTP');
      }

      const userData = {
        ...response.data.user,
        token: response.data.token
      };

      setUser(userData);

      localStorage.setItem(
        'safeplots_user',
        JSON.stringify(userData)
      );

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */

  const resendOtp = async (email: string) => {

    setIsLoading(true);

    try {

      const response = await authService.resendOtp(email);

      if (!response.success) {
        throw new Error(response.error || 'Failed to resend OTP');
      }

      console.log('[DEV] New OTP sent to:', email);

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= UPDATE PROFILE ================= */

  const updateProfile = async (data: Partial<User>) => {

    if (!user) return;

    const response = await authService.updateProfile(data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to update profile');
    }

    const updatedUser = { ...user, ...data };

    setUser(updatedUser);

    localStorage.setItem(
      'safeplots_user',
      JSON.stringify(updatedUser)
    );
  };

  /* ================= CHANGE PASSWORD ================= */

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {

    if (!user) throw new Error('Not authenticated');

    setIsLoading(true);

    try {

      const response = await authService.changePassword(
        currentPassword,
        newPassword
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to change password');
      }

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */

  const forgotPassword = async (email: string) => {

    setIsLoading(true);

    try {

      const response = await authService.forgotPassword(email);

      if (!response.success) {
        throw new Error(response.error || 'Failed to send OTP');
      }

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */

  const resetPassword = async (
    token: string,
    newPassword: string
  ) => {

    setIsLoading(true);

    try {

      const response = await authService.resetPassword(
        token,
        newPassword
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to reset password');
      }

    } finally {
      setIsLoading(false);
    }
  };

  /* ================= ⭐ UPDATE USER ROLE ================= */

  const updateUserRole = (role: 'user' | 'seller' | 'admin') => {

    setUser((prev) => {

      if (!prev) return prev;

      const updatedUser = {
        ...prev,
        role
      };

      localStorage.setItem(
        'safeplots_user',
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  /* ================= CONTEXT VALUE ================= */

  return (

    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,

        login,
        logout,

        register,
        verifyOtp,
        resendOtp,

        updateProfile,
        changePassword,

        forgotPassword,
        resetPassword,

        updateUserRole
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = (): AuthContextType => {

  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
