import { toast } from '@/hooks/use-toast';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Error messages for different status codes
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please login again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please try again later.',
  500: 'Something went wrong. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service is under maintenance. Please try again later.',
};

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('safeplots_user');
  // Redirect to login page
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth?expired=true';
  }
};

// Main error handler
export const handleApiError = (error: ApiError): void => {
  const { status, message, code } = error;

  // Handle 401 - Unauthorized (auto logout)
  if (status === 401) {
    toast({
      title: 'Session Expired',
      description: 'Please login again to continue.',
      variant: 'destructive',
    });
    handleLogout();
    return;
  }

  // Handle 403 - Forbidden
  if (status === 403) {
    toast({
      title: 'Access Denied',
      description: message || ERROR_MESSAGES[403],
      variant: 'destructive',
    });
    return;
  }

  // Handle network errors
  if (status === 0 || code === 'NETWORK_ERROR') {
    toast({
      title: 'Connection Error',
      description: 'Please check your internet connection and try again.',
      variant: 'destructive',
    });
    return;
  }

  // Handle specific error codes
  switch (code) {
    case 'TOKEN_EXPIRED':
      handleLogout();
      break;
    case 'INVALID_CREDENTIALS':
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
      break;
    case 'USER_BANNED':
      toast({
        title: 'Account Suspended',
        description: 'Your account has been suspended. Contact support for assistance.',
        variant: 'destructive',
      });
      handleLogout();
      break;
    case 'EMAIL_NOT_VERIFIED':
      toast({
        title: 'Email Not Verified',
        description: 'Please verify your email to continue.',
        variant: 'destructive',
      });
      break;
    case 'SELLER_NOT_VERIFIED':
      toast({
        title: 'Seller Not Verified',
        description: 'Your seller account is pending verification.',
        variant: 'destructive',
      });
      break;
    default:
      // Generic error toast
      toast({
        title: 'Error',
        description: message || ERROR_MESSAGES[status] || 'Something went wrong.',
        variant: 'destructive',
      });
  }
};

// Wrapper for async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    showSuccess?: boolean;
    successMessage?: string;
    onError?: (error: ApiError) => void;
  }
): Promise<T | null> {
  try {
    const result = await operation();
    
    if (options?.showSuccess) {
      toast({
        title: 'Success',
        description: options.successMessage || 'Operation completed successfully.',
      });
    }
    
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      if (options?.onError) {
        options.onError(error);
      }
    }
    return null;
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('safeplots_user');
  return !!user;
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('safeplots_user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
};
