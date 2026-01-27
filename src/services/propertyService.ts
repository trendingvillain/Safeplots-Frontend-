// Property Service - Handles all property-related API calls (API mode only)
import { apiClient, API_ENDPOINTS, PropertyQueryParams, PaginatedResponse, ApiResponse } from '@/lib/apiClient';
import { Property } from '@/types';

export interface PropertyFormData {
  title: string;
  description: string;
  type: Property['type'];
  price: number;
  priceOnRequest?: boolean;
  area: number;
  areaUnit: Property['areaUnit'];
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  features?: string[];
  images?: string[];
  video?: string;
}

// Get list of properties with filters and pagination
export async function getProperties(params: PropertyQueryParams): Promise<PaginatedResponse<Property>> {
  const response = await apiClient.get<PaginatedResponse<Property>>(API_ENDPOINTS.PROPERTIES.LIST, params as Record<string, string | number | boolean | undefined>);
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch properties');
}

// Get featured properties for homepage
export async function getFeaturedProperties(limit: number = 6): Promise<Property[]> {
  const response = await apiClient.get<Property[]>(API_ENDPOINTS.PROPERTIES.FEATURED, { limit });
  
  if (response.success && response.data) {
    return response.data;
  }
  
  throw new Error(response.error || 'Failed to fetch featured properties');
}

// Get single property details
export async function getPropertyById(id: string): Promise<Property | null> {
  const response = await apiClient.get<Property>(API_ENDPOINTS.PROPERTIES.DETAILS(id));
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return null;
}

// Get properties by seller
export async function getPropertiesBySeller(
  sellerId: string
): Promise<Property[]> {
  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.PROPERTIES.BY_SELLER(sellerId)
    );

    const payload =
      response?.data?.data ??
      response?.data ??
      response;

    // Case 1: API returns array
    if (Array.isArray(payload)) {
      return payload;
    }

    // Case 2: { properties: [] }
    if (Array.isArray(payload?.properties)) {
      return payload.properties;
    }

    // Case 3: { data: [] }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    // Case 4: { data: { properties: [] } }
    if (Array.isArray(payload?.data?.properties)) {
      return payload.data.properties;
    }

    console.warn('Unexpected properties response:', payload);
    return [];
  } catch (error) {
    console.error('getPropertiesBySeller failed:', error);
    return [];
  }
}


// Track property view - increments view count
export async function trackPropertyView(id: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.PROPERTIES.VIEW(id), {});
  } catch (error) {
    // Silent fail for view tracking
    console.error('Failed to track property view:', error);
  }
}

// Create new property
export async function createProperty(data: PropertyFormData): Promise<ApiResponse<Property>> {
  return apiClient.post<Property>(API_ENDPOINTS.PROPERTIES.CREATE, data);
}

// Update property
export async function updateProperty(id: string, data: Partial<PropertyFormData>): Promise<ApiResponse<Property>> {
  return apiClient.put<Property>(API_ENDPOINTS.PROPERTIES.UPDATE(id), data);
}

// Delete property
export async function deleteProperty(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete(API_ENDPOINTS.PROPERTIES.DELETE(id));
}

// Update property status (for sellers - mark as sold)
export async function updatePropertyStatus(id: string, status: Property['status']): Promise<ApiResponse<Property>> {
  return apiClient.patch<Property>(API_ENDPOINTS.PROPERTIES.STATUS(id), { status });
}

// Send inquiry for a property
export async function sendInquiry(propertyId: string, message: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.INQUIRIES.SEND, { propertyId, message });
}

// Report a property
export async function reportProperty(propertyId: string, reason: string, description: string): Promise<ApiResponse<void>> {
  return apiClient.post(API_ENDPOINTS.REPORTS.CREATE, { propertyId, reason, description });
}