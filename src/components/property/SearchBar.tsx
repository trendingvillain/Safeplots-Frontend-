import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDIAN_STATES, PROPERTY_TYPES, PRICE_RANGES, SearchFilters } from '@/types';
import { Search, MapPin, Home, IndianRupee, SlidersHorizontal, X, Building2, Map as MapIcon } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  variant?: 'hero' | 'compact';
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, variant = 'hero', className = '' }) => {
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    pincode: searchParams.get('pincode') || '',
    title: searchParams.get('title') || '',
    address: searchParams.get('location.address') || '',
    type: searchParams.get('type') as any || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const empty = { city: '', state: '', pincode: '', title: '', address: '', type: undefined };
    setFilters(empty);
    onSearch(empty);
  };

  // Compact View (Used on results page)
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-3 items-end ${className}`}>
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Search city, area or street..."
            // This maps to the address field for partial matching in the backend
            value={filters.address || ''}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="h-11"
          />
        </div>
        <Button onClick={handleSearch} className="h-11 gap-2 px-6">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl p-6 shadow-xl border border-border ${className}`}>
      {/* --- SIMPLE VIEW (Main 4 Filters) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Property Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            Property Type
          </Label>
          <Select
            value={filters.type}
            onValueChange={(val) => setFilters({...filters, type: val as any})}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 2. City / Area (Partial Search Field) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            City / Area
          </Label>
          <Input
            placeholder="Search street or area"
            value={filters.address || ''}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </div>

        {/* 3. District */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-primary" />
            District
          </Label>
          <Input
            placeholder="e.g. Thoothukudi"
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>

        {/* 4. State */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            State
          </Label>
          <Select
            value={filters.state}
            onValueChange={(value) => setFilters({ ...filters, state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- ADVANCED VIEW --- */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
          
          {/* 1. Pincode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pincode</Label>
            <Input
              placeholder="6-digit pincode"
              value={filters.pincode || ''}
              maxLength={6}
              onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
            />
          </div>

          {/* 2. Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Property Title
            </Label>
            <Input
              placeholder="e.g. King House"
              value={filters.title || ''}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
          </div>

          {/* 
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Budget
            </Label>
            <Select
              value={filters.minPrice ? `${filters.minPrice}-${filters.maxPrice}` : undefined}
              onValueChange={(value) => {
                const [min, max] = value.split('-').map(Number);
                setFilters({ ...filters, minPrice: min, maxPrice: max || undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((range, idx) => (
                  <SelectItem key={idx} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          3. Budget */}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-primary hover:bg-primary/5"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide Options' : 'More Options'}
          </Button>
          
          {Object.values(filters).some(x => x !== '' && x !== undefined) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        <Button onClick={handleSearch} size="lg" className="px-10 shadow-lg shadow-primary/20">
          <Search className="h-4 w-4 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;