// User Service - Handles all user-related API calls (API mode only)
import { apiClient, API_ENDPOINTS, ApiResponse } from '@/lib/apiClient';
import { Property, Inquiry, PropertyView, UserStats } from '@/types';

// Get user's saved properties
export async function getSavedProperties(): Promise<Property[]> {
  const response = await apiClient.get<Property[]>(API_ENDPOINTS.USERS.SAVED_PROPERTIES);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
}

// Save a property
export async function saveProperty(propertyId: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.USERS.SAVE_PROPERTY(propertyId));
}

// Unsave a property
export async function unsaveProperty(propertyId: string): Promise<ApiResponse<void>> {
  return apiClient.delete(API_ENDPOINTS.USERS.UNSAVE_PROPERTY(propertyId));
}

// Get user's viewed properties history
export async function getViewedProperties(): Promise<PropertyView[]> {
  const response = await apiClient.get<PropertyView[]>(API_ENDPOINTS.USERS.VIEWED_PROPERTIES);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
}

// Get user's sent inquiries
export async function getSentInquiries(): Promise<Inquiry[]> {
  const response = await apiClient.get<Inquiry[]>(API_ENDPOINTS.USERS.INQUIRIES);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
}

// Get user stats
export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>(API_ENDPOINTS.USERS.STATS);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return { savedProperties: 0, sentInquiries: 0, viewedProperties: 0 };
}

// Update user profile
export async function updateUserProfile(data: { name?: string; phone?: string }): Promise<ApiResponse<void>> {
  return apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
}

// Track property view
export async function trackPropertyView(propertyId: string): Promise<void> {
  // This is fire-and-forget, we don't need to wait for response
  apiClient.post(`/properties/${propertyId}/view`).catch(() => {});
}
