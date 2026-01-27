import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import SearchBar from '@/components/property/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getProperties } from '@/services/propertyService';
import { getSavedProperties } from '@/services/userService';
import { Property, SearchFilters } from '@/types';
import { getPageNumbers } from '@/hooks/usePagination';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PropertiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const currentPage = Number(searchParams.get('page')) || 1;
    const { toast } = useToast();

  const filters: SearchFilters = {
    address:searchParams.get('address') || undefined,
    state: searchParams.get('state') || undefined,
    city: searchParams.get('city') || undefined,
    pincode: searchParams.get('pincode') || undefined,
    type: searchParams.get('type') as SearchFilters['type'] || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  };

    const getPageTitle = () => {
    const parts: string[] = [];
    if (filters.type) {
      const typeLabel = filters.type.charAt(0).toUpperCase() + filters.type.slice(1) + 's';
      parts.push(typeLabel);
    } else {
      parts.push('Properties');
    }

    if (filters.address) {
      return `${parts.join(' ')} in ${filters.address}`;
    }
    
    if (filters.city) {
      return `${parts.join(' ')} in ${filters.city}`;
    }
    if (filters.pincode) {
      return `${parts.join(' ')} in ${filters.pincode}`;
    }
    if (filters.state) {
      return `${parts.join(' ')} in ${filters.state}`;
    }
    return 'Browse All Properties';
  };

  const pageTitle = getPageTitle();

  // Update document title
 useEffect(() => {
  // ----- PAGE TITLE -----
  const fullTitle = `${pageTitle} | Verified Plots & Properties | SafePlot.in`;
  document.title = fullTitle;

  // ----- META DESCRIPTION -----
  const desc = `${
    filters.address || filters.city || filters.pincode || filters.state
      ? `Explore verified real estate in ${filters.address || filters.city || filters.pincode || filters.state}. `
      : `Browse verified properties, plots & homes. `
  }Check flood risks, land data, ownership insights & safety before buying.`;

  // ----- META KEYWORDS -----
  const keywords = [
    "verified plots",
    "safe plots",
    "property safety",
    "flood zone",
    "plot verification",
    "land data",
    "real estate",
    filters.city && `${filters.city} plots`,
    filters.pincode && `${filters.pincode} plots`,
    filters.state && `${filters.state} real estate`,
    filters.type && `${filters.type} for sale`,
  ]
    .filter(Boolean)
    .join(", ");

  const setMeta = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  setMeta("description", desc);
  setMeta("keywords", keywords);

  // ----- CANONICAL URL -----
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.href);

  // ----- CLEANUP -----
  return () => {
    document.title = "SafePlots - Buy Verified Plots & Homes";
  };
}, [pageTitle, filters]);


  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Constructing query object with all fields you requested
      const query = {
        page: currentPage,
        status: 'approved',
        sort: searchParams.get('sort') || 'newest',
        // Identity & Location Filters
        title: searchParams.get('title') || undefined,
        city: searchParams.get('city') || undefined,
        state: searchParams.get('state') || undefined,
        pincode: searchParams.get('pincode') || undefined,
        address: searchParams.get('address') || undefined,
        type: searchParams.get('type') || undefined,
      };

      const response = await getProperties(query);
      
      setProperties(response.items || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      getSavedProperties().then(p => setSavedPropertyIds(p.map(i => i.id))).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Clean URL Reset
  const clearFilters = () => setSearchParams({});

  const activeFilterCount = Array.from(searchParams.keys()).filter(k => k !== 'page' && k !== 'sort').length;

  return (
    <Layout>
      <section className="bg-muted/30 py-10 border-b">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Search Verified Properties</h1>
          <SearchBar 
            onSearch={(filters) => {
              const p = new URLSearchParams();
              Object.entries(filters).forEach(([k, v]) => v && p.set(k, String(v)));
              setSearchParams(p);
            }} 
          />
        </div>
      </section>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `${totalCount} Matches Found`}
            </h2>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" onClick={clearFilters} className="cursor-pointer hover:bg-destructive hover:text-white transition-colors">
                Clear {activeFilterCount} Filters ×
              </Badge>
            )}
          </div>

          <Select value={searchParams.get('sort') || 'newest'} onValueChange={(v) => {
            const p = new URLSearchParams(searchParams);
            p.set('sort', v);
            setSearchParams(p);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PropertyCardSkeleton count={6} />
          </div>
        ) : properties.length === 0 ? (
          <EmptyState 
            icon={<Search className="h-12 w-12 text-muted-foreground" />}
            title="No Results Found"
            description="We couldn't find anything matching your address, city, or pincode."
            action={<Button onClick={clearFilters}>View All Properties</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map(item => (
              <PropertyCard 
                key={item.id} 
                property={item} 
                isSaved={savedPropertyIds.includes(item.id)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => { if(currentPage > 1) { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage - 1)); setSearchParams(p); }}} 
                    className={currentPage === 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {getPageNumbers(currentPage, totalPages).map((n, i) => (
                  <PaginationItem key={i}>
                    {n === 'ellipsis' ? <PaginationEllipsis /> : (
                      <PaginationLink 
                        isActive={currentPage === n} 
                        onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(n)); setSearchParams(p); }}
                        className="cursor-pointer"
                      >
                        {n}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => { if(currentPage < totalPages) { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage + 1)); setSearchParams(p); }}} 
                    className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertiesPage;
