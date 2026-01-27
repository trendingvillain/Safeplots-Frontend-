// Utility functions for formatting data
import { Property } from '@/types';

/**
 * Format price in Indian currency format
 * @param price - Price in number
 * @returns Formatted price string (e.g., "₹45 Lakh", "₹1.2 Cr")
 */
export function formatPrice(price?: number | null): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return '₹0';
  }

  if (price >= 10000000) {
    const crValue = price / 10000000;
    return `₹${Number.isInteger(crValue) ? crValue : crValue.toFixed(2)} Cr`;
  }

  if (price >= 100000) {
    const lakhValue = price / 100000;
    return `₹${Number.isInteger(lakhValue) ? lakhValue : lakhValue.toFixed(1)} Lakh`;
  }

  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format area with unit
 * @param area - Area value
 * @param unit - Unit of measurement
 * @returns Formatted area string (e.g., "2,400 Sq.Ft.")
 */
export function formatArea(area?: number | null, unit?: string): string {
  if (area === null || area === undefined || Number.isNaN(area)) {
    return '0';
  }

  const unitLabels: Record<string, string> = {
    sqft: 'Sq.Ft.',
    sqm: 'Sq.M.',
    sqyd: 'Sq.Yd.',
    acre: 'Acre',
    hectare: 'Hectare',
    cent: 'Cent',
    guntha: 'Guntha',
  };

  return `${area.toLocaleString('en-IN')} ${unitLabels[unit ?? ''] || unit || ''}`;
}

/**
 * Get human-readable property type label
 * @param type - Property type
 * @returns Label string
 */
export function getPropertyTypeLabel(type: Property['type'] | null | undefined): string {
  const labels: Record<Property['type'], string> = {
    plot: 'Plot',
    house: 'House',
    flat: 'Flat',
    villa: 'Villa',
    farmland: 'Farmland',
  };

  return type ? labels[type] || type : '—';
}
