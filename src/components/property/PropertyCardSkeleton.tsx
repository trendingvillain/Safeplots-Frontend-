import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyCardSkeletonProps {
  count?: number;
}

const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden bg-card border-border/50">
          {/* Image Skeleton */}
          <div className="relative aspect-[4/3]">
            <Skeleton className="h-full w-full" />
            
            {/* Badge skeletons */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            {/* Heart button skeleton */}
            <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded" />
          </div>
          
          {/* Content Skeleton */}
          <CardContent className="p-4">
            {/* Price */}
            <Skeleton className="h-7 w-28 mb-2" />
            
            {/* Title */}
            <Skeleton className="h-5 w-full mb-2" />
            
            {/* Location */}
            <div className="flex items-center gap-1.5 mb-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            
            {/* Details */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default PropertyCardSkeleton;
