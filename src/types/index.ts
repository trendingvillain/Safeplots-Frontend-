// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'plot' | 'house' | 'flat' | 'villa' | 'farmland';
  price: number;
  priceOnRequest?: boolean;
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acre' | 'gunta' | 'cent';
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  video?: string;
  amenities?: string[];
  features?: string[];
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  inquiries: number;
  reportCount?: number;
}

// Seller Types
export interface Seller {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  idProofType: 'aadhar' | 'pan' | 'voter_id' | 'passport';
  idProofUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  isVerified: boolean;
  totalProperties: number;
  totalSold: number;
  rating: number;
  createdAt: string;
}

// Inquiry Types
export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerId: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

// Report Types
export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterId: string;
  reporterName: string;
  reason: 'fraud' | 'incorrect_info' | 'duplicate' | 'sold' | 'inappropriate' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'false_information' | 'closed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// User Activity Types
export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'login' | 'logout' | 'view_property' | 'save_property' | 'send_inquiry' | 'report_property' | 'register';
  details?: string;
  propertyId?: string;
  propertyTitle?: string;
  ipAddress?: string;
  createdAt: string;
}

// Property View History
export interface PropertyView {
  id: string;
  userId: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyPrice: number;
  propertyLocation: string;
  viewedAt: string;
}

// User Types with extended fields
export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'seller' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  isVerified?: boolean;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalViews?: number;
  totalInquiries?: number;
  totalSaved?: number;
}

// Search Filters
export interface SearchFilters {
  state?: string;
  city?: string;
  pincode?: string;
  type?: Property['type'];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  isVerified?: boolean;
  address?: string;
  title?: string;
}

// API Response Types
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

// Dashboard Stats
export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProperties: number;
  pendingApprovals: number;
  pendingSellerVerifications: number;
  totalInquiries: number;
  propertiesSold: number;
  totalReports: number;
  bannedUsers: number;
}

export interface SellerStats {
  totalProperties: number;
  liveProperties: number;
  pendingProperties: number;
  soldProperties: number;
  totalInquiries: number;
  newInquiries: number;
  totalViews: number;
}

export interface UserStats {
  savedProperties: number;
  sentInquiries: number;
  viewedProperties: number;
}

// Indian States and Cities
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export const PROPERTY_TYPES = [
  { value: 'plot', label: 'Plot' },
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'farmland', label: 'Farmland' },
];

export const AREA_UNITS = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'sqm', label: 'Sq. M.' },
  { value: 'acre', label: 'Acre' },
  { value: 'gunta', label: 'Gunta' },
  { value: 'cent', label: 'Cent' },
];

export const PRICE_RANGES = [
  { min: 0, max: 500000, label: 'Under ₹5 Lakh' },
  { min: 500000, max: 1000000, label: '₹5 - 10 Lakh' },
  { min: 1000000, max: 2500000, label: '₹10 - 25 Lakh' },
  { min: 2500000, max: 5000000, label: '₹25 - 50 Lakh' },
  { min: 5000000, max: 10000000, label: '₹50 Lakh - 1 Cr' },
  { min: 10000000, max: 50000000, label: '₹1 - 5 Cr' },
  { min: 50000000, max: Infinity, label: 'Above ₹5 Cr' },
];

export const REPORT_REASONS = [
  { value: 'fraud', label: 'Fraudulent Listing' },
  { value: 'incorrect_info', label: 'Incorrect Information' },
  { value: 'duplicate', label: 'Duplicate Listing' },
  { value: 'sold', label: 'Already Sold' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'other', label: 'Other' },
];

export const REPORT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'false_information', label: 'False Information' },
  { value: 'closed', label: 'Closed' },
];
