// Seller Service - Handles all seller-related API calls (API mode only)
import { apiClient, API_ENDPOINTS, ApiResponse } from '@/lib/apiClient';
import { Property, Inquiry, Seller, SellerStats } from '@/types';

export interface SellerRegistrationData {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  id_proof_type: string;
  id_proof_url: string;
}

// Register as seller - uses proper JSON format
export async function registerAsSeller(data: SellerRegistrationData): Promise<ApiResponse<Seller>> {
  return apiClient.post<Seller>(API_ENDPOINTS.SELLERS.REGISTER, data);
}

// Get seller profile
export async function getSellerProfile(): Promise<Seller | null> {
  const response = await apiClient.get<Seller>(API_ENDPOINTS.SELLERS.PROFILE);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return null;
}

// Get seller's properties
export async function getSellerProperties(): Promise<Property[]> {
  const response = await apiClient.get<Property[]>(API_ENDPOINTS.SELLERS.PROPERTIES);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
}

// Get seller's inquiries
export async function getSellerInquiries(): Promise<Inquiry[]> {
  const response = await apiClient.get<Inquiry[]>(API_ENDPOINTS.SELLERS.INQUIRIES);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
}

// Get seller stats
export async function getSellerStats(): Promise<SellerStats> {
  const response = await apiClient.get<SellerStats>(API_ENDPOINTS.SELLERS.STATS);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return { totalProperties: 0, liveProperties: 0, pendingProperties: 0, soldProperties: 0, totalInquiries: 0, newInquiries: 0, totalViews: 0 };
}

// Update inquiry status (contacted/closed)
export async function updateInquiryStatus(inquiryId: string, status: Inquiry['status']): Promise<ApiResponse<Inquiry>> {
  return apiClient.patch<Inquiry>(API_ENDPOINTS.SELLERS.UPDATE_INQUIRY(inquiryId), { status });
}

// Upload ID proof document
export async function uploadIdProof(file: File): Promise<ApiResponse<{ url: string }>> {
  return apiClient.upload<{ url: string }>('/upload/document', file);
}

// Upload property images
export async function uploadPropertyImages(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
  // Upload files one by one and collect URLs
  const urls: string[] = [];
  for (const file of files) {
    const response = await apiClient.upload<{ url: string }>('/upload/property-image', file);
    if (response.success && response.data) {
      urls.push(response.data.url);
    }
  }
  
  return { success: true, data: { urls } };
}

// Upload property video
export async function uploadPropertyVideo(file: File): Promise<ApiResponse<{ url: string }>> {
  return apiClient.upload<{ url: string }>('/upload/property-video', file);
}