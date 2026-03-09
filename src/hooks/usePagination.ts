import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalCount?: number;
}

interface UsePaginationReturn<T> {
  // State
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
  
  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotalCount: (count: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
  
  // Utility
  paginateData: (data: T[]) => T[];
  getQueryParams: () => { page: number; limit: number };
}

export function usePagination<T = unknown>(
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, initialLimit = 12, totalCount: initialTotalCount = 0 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Calculated values
  const totalPages = useMemo(() => Math.ceil(totalCount / limit), [totalCount, limit]);
  const hasMore = useMemo(() => page * limit < totalCount, [page, limit, totalCount]);
  const hasPrevious = useMemo(() => page > 1, [page]);

  // Actions
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (hasPrevious) {
      setPage((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const goToPage = useCallback((newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(clampedPage);
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  // Handle limit change (reset to page 1)
  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  // Client-side pagination helper
  const paginateData = useCallback((data: T[]): T[] => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex);
  }, [page, limit]);

  // Get query params for API
  const getQueryParams = useCallback(() => ({
    page,
    limit,
  }), [page, limit]);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasMore,
    hasPrevious,
    setPage,
    setLimit: handleSetLimit,
    setTotalCount,
    nextPage,
    prevPage,
    goToPage,
    reset,
    paginateData,
    getQueryParams,
  };
}

// Generate page numbers for pagination UI
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  // Calculate start and end of visible range
  let start = Math.max(2, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if we're near the beginning or end
  if (currentPage <= halfVisible + 1) {
    end = Math.min(totalPages - 1, maxVisible - 1);
  } else if (currentPage >= totalPages - halfVisible) {
    start = Math.max(2, totalPages - maxVisible + 2);
  }

  // Add ellipsis before visible range if needed
  if (start > 2) {
    pages.push('ellipsis');
  }

  // Add visible pages
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis after visible range if needed
  if (end < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
