import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/types';
import { formatPrice, formatArea, getPropertyTypeLabel } from '@/lib/formatters';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { MapPin, Maximize, CheckCircle2, Lock } from 'lucide-react'; 
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onSave?: (id: string) => void;
  isSaved?: boolean;
  showStatus?: boolean;
  
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSold: initialIsSold }) => {
  const isSold = property.status === 'sold';
  const displayPrice = property.price > 0 ? formatPrice(property.price) : 'Price on Request';

  const primaryImage = useMemo(() => {
    return property.images?.[0] || '';
  }, [property.images]);

  return (
    /* Wrap everything in a Link to make it clickable */
    <Link to={`/property/${property.id}`} className="block">
      <Card className={cn(
        "group overflow-hidden bg-card border-border/50 hover:shadow-xl transition-all duration-300 cursor-pointer",
        isSold && "opacity-90"
      )}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <ImageWithFallback
            src={primaryImage}
            alt={property.title}
            className={cn(
              "h-full w-full transition-transform duration-500 group-hover:scale-110",
              isSold && "grayscale-[0.5]"
            )}
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60" />
          
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
              {getPropertyTypeLabel(property.type)}
            </Badge>

            {isSold ? (
              <Badge variant="destructive" className="animate-pulse shadow-lg uppercase font-bold text-[10px]">
                <Lock className="h-3 w-3 mr-1" /> Sold Out
              </Badge>
            ) : (
              property.isVerified && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
            <span className={cn(
              "text-lg font-bold text-white drop-shadow-md",
              isSold && "line-through opacity-70"
            )}>
              {displayPrice}
            </span>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">
              {property.location?.city || 'N/A'}, {property.location?.state || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Maximize className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {formatArea(property.area, property.areaUnit)}
              </span>
            </div>
            
            {/* Button is now visually a button but acts as part of the link */}
            <Button 
              size="sm" 
              variant={isSold ? "secondary" : "outline"} 
              className="text-xs h-8 pointer-events-none" 
              asChild
            >
              <span>{isSold ? 'Sold' : 'View Details'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;