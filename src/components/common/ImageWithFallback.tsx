// components/common/ImageWithFallback.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import { convertGDriveUrl, isGDriveUrl } from '@/lib/gdriveUtils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showFallbackIcon?: boolean;
}

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className,
  fallbackSrc = PLACEHOLDER_IMAGE,
  showFallbackIcon = true,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states if the source URL changes
  useEffect(() => {
    setHasError(false);
    setFallbackError(false);
    setIsLoading(true);
  }, [src]);

  const processedSrc = useMemo(() => {
    if (!src) return fallbackSrc;
    return isGDriveUrl(src) ? convertGDriveUrl(src) : src;
  }, [src, fallbackSrc]);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
    } else {
      setFallbackError(true);
    }
    setIsLoading(false);
  }, [hasError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (fallbackError && showFallbackIcon) {
    return (
      <div className={cn('flex items-center justify-center bg-muted', className)}>
        <ImageOff className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {isLoading && <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />}
      
      <img
        src={hasError ? fallbackSrc : processedSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;