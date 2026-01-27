// Custom hook for API queries with loading, error, and retry states
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiQueryOptions<T> {
  queryFn: () => Promise<T>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  showErrorToast?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export function useApiQuery<T>({
  queryFn,
  enabled = true,
  onSuccess,
  onError,
  retryCount = 0,
  showErrorToast = true,
}: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retries, setRetries] = useState(0);
  const { toast } = useToast();

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      
      // Retry logic
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(() => fetchData(isRefetch), 1000 * (retries + 1));
        return;
      }
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch data',
          variant: 'destructive',
        });
      }
      
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [queryFn, enabled, onSuccess, onError, retryCount, retries, showErrorToast, toast]);

  useEffect(() => {
    fetchData();
  }, [enabled]); // Only re-run when enabled changes

  const refetch = useCallback(async () => {
    setRetries(0);
    await fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, refetch, isRefetching };
}

// Mutation hook for POST/PUT/DELETE operations
interface UseMutationOptions<T, V> {
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}

export function useMutation<T, V = void>({
  mutationFn,
  onSuccess,
  onError,
  showSuccessToast = false,
  successMessage = 'Operation completed successfully',
  showErrorToast = true,
}: UseMutationOptions<T, V>): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const mutate = async (variables: V): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mutationFn(variables);
      setData(result);
      
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: error.message || 'Operation failed',
          variant: 'destructive',
        });
      }
      
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return { mutate, isLoading, error, data, reset };
}
