// API Client for all backend requests
// Uses VITE_API_URL from .env - API mode only

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_URL is not configured in .env file');
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('safeplots_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Build URL with query parameters
const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const base = `${API_BASE_URL}${endpoint}`;
  
  if (!params) return base;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
};

class ApiClient {
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    if (!API_BASE_URL) {
      return { success: false, error: 'API URL not configured. Please set VITE_API_URL in .env file.' };
    }

    const { params, ...fetchConfig } = config;
    const url = buildUrl(endpoint, params);
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      });

      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('safeplots_user');
        window.location.href = '/auth';
        return { success: false, error: 'Session expired. Please login again.' };
      }

      // Handle forbidden
      if (response.status === 403) {
        return { success: false, error: 'You do not have permission to perform this action.' };
      }

      // Handle server errors
      if (response.status >= 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      }

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<ApiResponse<T>> {
    if (!API_BASE_URL) {
      return { success: false, error: 'API URL not configured. Please set VITE_API_URL in .env file.' };
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false, error: 'Upload failed. Please try again.' };
    }
  }
}

export const apiClient = new ApiClient();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE_LOGIN: '/auth/google',
    GOOGLE_REGISTER: '/auth/google-register',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_OTP: '/auth/send-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Properties
  PROPERTIES: {
    LIST: '/properties',
    DETAILS: (id: string) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    STATUS: (id: string) => `/properties/${id}/status`,
    VIEW: (id: string) => `/properties/${id}/view`,
    BY_SELLER: (sellerId: string) => `/sellers/${sellerId}/properties`,
    FEATURED: '/properties/featured',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    SAVED_PROPERTIES: '/users/saved-properties',
    SAVE_PROPERTY: (propertyId: string) => `/users/saved-properties/${propertyId}`,
    UNSAVE_PROPERTY: (propertyId: string) => `/users/saved-properties/${propertyId}`,
    VIEWED_PROPERTIES: '/users/viewed-properties',
    INQUIRIES: '/users/inquiries',
    STATS: '/users/stats',
  },
  
  // Sellers
  SELLERS: {
    REGISTER: '/sellers/register',
    PROFILE: '/sellers/profile',
    PROPERTIES: '/sellers/properties',
    INQUIRIES: '/sellers/inquiries',
    STATS: '/sellers/stats',
    UPDATE_INQUIRY: (id: string) => `/sellers/inquiries/${id}`,
  },
  
  // Inquiries
  INQUIRIES: {
    SEND: '/inquiries',
    LIST: '/inquiries',
    UPDATE: (id: string) => `/inquiries/${id}`,
  },
  
  // Reports
  REPORTS: {
    CREATE: '/reports',
    LIST: '/reports',
    UPDATE: (id: string) => `/reports/${id}`,
  },
  
  // Admin
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    USER_DETAILS: (id: string) => `/admin/users/${id}`,
    BAN_USER: (id: string) => `/admin/users/${id}/ban`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    SELLERS: '/admin/sellers',
    SELLER_DETAILS: (id: string) => `/admin/sellers/${id}`,
    APPROVE_SELLER: (id: string) => `/admin/sellers/${id}/approve`,
    REJECT_SELLER: (id: string) => `/admin/sellers/${id}/reject`,
    PROPERTIES: '/admin/properties',
    PROPERTY_DETAILS: (id: string) => `/admin/properties/${id}`,
    APPROVE_PROPERTY: (id: string) => `/admin/properties/${id}/approve`,
    REJECT_PROPERTY: (id: string) => `/admin/properties/${id}/reject`,
    SUSPEND_PROPERTY: (id: string) => `/admin/properties/${id}/suspend`,
    REPORTS: '/admin/reports',
    REPORT_ACTION: (id: string) => `/admin/reports/${id}`,
    ACTIVITIES: '/admin/activities',
  },
};

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular';
  state?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}
