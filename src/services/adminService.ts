// Admin Service - Handles all admin-related API calls (API mode only)
import { apiClient, API_ENDPOINTS, ApiResponse } from '@/lib/apiClient';
import { Property, Seller, AdminStats, AppUser, UserActivity, PropertyReport } from '@/types';

// Helper to safely extract array from paginated response
const extractArray = <T>(data: unknown, key: string): T[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && key in data) {
    const arr = (data as Record<string, unknown>)[key];
    return Array.isArray(arr) ? arr : [];
  }
  return [];
};

// Get admin dashboard stats
export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch admin stats');
}

// Get all users with search
export async function getUsers(search?: string): Promise<AppUser[]> {
  const response = await apiClient.get<{ users: AppUser[] } | AppUser[]>(API_ENDPOINTS.ADMIN.USERS, { search });
  
  if (response.success && response.data) {
    // Backend returns { users: [...], total, page, pageSize, totalPages }
    return extractArray<AppUser>(response.data, 'users');
  }
  
  return [];
}

// Ban/Unban user
export async function toggleUserBan(userId: string, ban: boolean): Promise<ApiResponse<AppUser>> {
  return apiClient.patch<AppUser>(API_ENDPOINTS.ADMIN.BAN_USER(userId), { ban });
}

// Delete user
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return apiClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
}

// Get all sellers with search
export async function getSellers(search?: string): Promise<Seller[]> {
  const response = await apiClient.get<Seller[] | { sellers: Seller[] }>(API_ENDPOINTS.ADMIN.SELLERS, { search });
  
  if (response.success && response.data) {
    // Backend returns array directly for sellers
    return extractArray<Seller>(response.data, 'sellers');
  }
  
  return [];
}

// Get seller details
export async function getSellerDetails(sellerId: string): Promise<Seller | null> {
  const response = await apiClient.get<Seller>(API_ENDPOINTS.ADMIN.SELLER_DETAILS(sellerId));
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return null;
}

// Approve seller
export async function approveSeller(sellerId: string): Promise<ApiResponse<Seller>> {
  return apiClient.post<Seller>(API_ENDPOINTS.ADMIN.APPROVE_SELLER(sellerId));
}

// Reject seller
export async function rejectSeller(sellerId: string, reason?: string): Promise<ApiResponse<Seller>> {
  return apiClient.post<Seller>(API_ENDPOINTS.ADMIN.REJECT_SELLER(sellerId), { reason });
}

// Get all properties with search
export async function getAllProperties(search?: string, status?: string): Promise<Property[]> {
  const response = await apiClient.get<{ properties: Property[] } | Property[]>(API_ENDPOINTS.ADMIN.PROPERTIES, { search, status });
  
  if (response.success && response.data) {
    // Backend returns { properties: [...], total, page, pageSize, totalPages }
    return extractArray<Property>(response.data, 'properties');
  }
  
  return [];
}

// Approve property
export async function approveProperty(propertyId: string): Promise<ApiResponse<Property>> {
  return apiClient.post<Property>(API_ENDPOINTS.ADMIN.APPROVE_PROPERTY(propertyId));
}

// Reject property
export async function rejectProperty(propertyId: string, reason?: string): Promise<ApiResponse<Property>> {
  return apiClient.post<Property>(API_ENDPOINTS.ADMIN.REJECT_PROPERTY(propertyId), { reason });
}

// Suspend property
export async function suspendProperty(propertyId: string, reason?: string): Promise<ApiResponse<Property>> {
  return apiClient.post<Property>(API_ENDPOINTS.ADMIN.SUSPEND_PROPERTY(propertyId), { reason });
}

// Unsuspend property
export async function unsuspendProperty(propertyId: string): Promise<ApiResponse<Property>> {
  return apiClient.patch<Property>(API_ENDPOINTS.ADMIN.PROPERTY_DETAILS(propertyId), { status: 'approved' });
}

// Update property (admin edit)
export async function adminUpdateProperty(propertyId: string, data: Partial<Property>): Promise<ApiResponse<Property>> {
  return apiClient.put<Property>(API_ENDPOINTS.ADMIN.PROPERTY_DETAILS(propertyId), data);
}

// Get user activities with search
export async function getActivities(search?: string): Promise<UserActivity[]> {
  const response = await apiClient.get<{ activities: UserActivity[] } | UserActivity[]>(API_ENDPOINTS.ADMIN.ACTIVITIES, { search });
  
  if (response.success && response.data) {
    // Backend returns { activities: [...], total, page, pageSize, totalPages }
    return extractArray<UserActivity>(response.data, 'activities');
  }
  
  return [];
}

// Get reports with search
export async function getReports(search?: string): Promise<PropertyReport[]> {
  const response = await apiClient.get<PropertyReport[] | { reports: PropertyReport[] }>(API_ENDPOINTS.ADMIN.REPORTS, { search });
  
  if (response.success && response.data) {
    // Backend returns array directly for reports
    return extractArray<PropertyReport>(response.data, 'reports');
  }
  
  return [];
}

// Update report status
export async function updateReportStatus(
  reportId: string, 
  status: PropertyReport['status'], 
  adminNotes?: string,
  suspendProperty?: boolean
): Promise<ApiResponse<PropertyReport>> {
  return apiClient.patch<PropertyReport>(API_ENDPOINTS.ADMIN.REPORT_ACTION(reportId), { 
    status, 
    adminNotes,
    suspendProperty 
  });
}