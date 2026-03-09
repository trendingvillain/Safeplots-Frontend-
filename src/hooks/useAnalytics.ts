import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Analytics event types
type AnalyticsEvent = 
  | 'property_view'
  | 'property_saved'
  | 'property_unsaved'
  | 'inquiry_sent'
  | 'property_reported'
  | 'seller_contacted'
  | 'search_performed'
  | 'filter_applied'
  | 'property_shared'
  | 'login'
  | 'logout'
  | 'register';

interface AnalyticsData {
  propertyId?: string;
  propertyTitle?: string;
  sellerId?: string;
  searchQuery?: string;
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

// Analytics storage key
const ANALYTICS_QUEUE_KEY = 'safeplots_analytics_queue';

// Get queued analytics
const getQueue = (): Array<{ event: string; data: AnalyticsData; timestamp: string }> => {
  try {
    const queue = localStorage.getItem(ANALYTICS_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
};

// Add to queue
const addToQueue = (event: AnalyticsEvent, data: AnalyticsData, userId?: string) => {
  const queue = getQueue();
  queue.push({
    event,
    data: {
      ...data,
      userId,
    },
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 100 events
  const trimmedQueue = queue.slice(-100);
  localStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(trimmedQueue));
};

// Hook for analytics tracking
export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback((event: AnalyticsEvent, data: AnalyticsData = {}) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event}`, { userId: user?.id, ...data });
    }

    // Store in local queue for later sync
    addToQueue(event, data, user?.id);

    // TODO: Send to backend when API is ready
    // apiClient.post('/analytics/track', { event, data, userId: user?.id });
    
    // TODO: Send to Google Analytics when integrated
    // if (window.gtag) {
    //   window.gtag('event', event, data);
    // }
  }, [user?.id]);

  // Track property view
  const trackPropertyView = useCallback((propertyId: string, propertyTitle?: string) => {
    track('property_view', { propertyId, propertyTitle });
  }, [track]);

  // Track inquiry sent
  const trackInquirySent = useCallback((propertyId: string, sellerId: string) => {
    track('inquiry_sent', { propertyId, sellerId });
  }, [track]);

  // Track property saved
  const trackPropertySaved = useCallback((propertyId: string) => {
    track('property_saved', { propertyId });
  }, [track]);

  // Track property unsaved
  const trackPropertyUnsaved = useCallback((propertyId: string) => {
    track('property_unsaved', { propertyId });
  }, [track]);

  // Track property reported
  const trackPropertyReported = useCallback((propertyId: string, reason: string) => {
    track('property_reported', { propertyId, reason });
  }, [track]);

  // Track search
  const trackSearch = useCallback((query: string, filters?: Record<string, unknown>) => {
    track('search_performed', { searchQuery: query, filters });
  }, [track]);

  // Track seller contact view
  const trackSellerContacted = useCallback((sellerId: string, propertyId: string) => {
    track('seller_contacted', { sellerId, propertyId });
  }, [track]);

  // Track property share
  const trackPropertyShared = useCallback((propertyId: string, platform?: string) => {
    track('property_shared', { propertyId, platform });
  }, [track]);

  return {
    track,
    trackPropertyView,
    trackInquirySent,
    trackPropertySaved,
    trackPropertyUnsaved,
    trackPropertyReported,
    trackSearch,
    trackSellerContacted,
    trackPropertyShared,
  };
};

// Get analytics queue (for debugging or syncing)
export const getAnalyticsQueue = () => getQueue();

// Clear analytics queue
export const clearAnalyticsQueue = () => {
  localStorage.removeItem(ANALYTICS_QUEUE_KEY);
};
