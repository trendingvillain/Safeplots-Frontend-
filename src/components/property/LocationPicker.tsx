import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// Default center (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  latitude, 
  longitude, 
  onLocationChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // Get current marker position
  const markerPosition = latitude && longitude 
    ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
    : null;

  // Get map center
  const center = markerPosition || defaultCenter;

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle map click to place marker
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    }
  }, [onLocationChange]);

  // Handle marker drag
  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationChange(lat.toFixed(6), lng.toFixed(6));
    }
  }, [onLocationChange]);

  // Search for location
  // Search for location
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !map) return;
    
    setIsSearching(true);
    const geocoder = new google.maps.Geocoder();
    
    try {
      // FIX: Ensure we handle the response as a GeocoderResponse object
      const response = await geocoder.geocode({ address: searchQuery + ', India' });
      
      // Safety check: Ensure results exist and have at least one entry
      if (response && response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        onLocationChange(lat.toFixed(6), lng.toFixed(6));
        map.panTo({ lat, lng });
        map.setZoom(15);
      } else {
        // Handle case where status is OK but results are empty
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Handle specific Google Maps errors (like ZERO_RESULTS)
      if (error instanceof Error) {
        alert('Search failed: ' + error.message);
      } else {
        alert('Could not find that location. Please try adding a city name.');
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, map, onLocationChange]);

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onLocationChange(lat.toFixed(6), lng.toFixed(6));
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location access.');
      }
    );
  }, [map, onLocationChange]);

  // Pan to marker when coordinates change externally
  useEffect(() => {
    if (map && markerPosition) {
      map.panTo(markerPosition);
    }
  }, [map, latitude, longitude]);

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <MapPin className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-sm text-destructive">Failed to load Google Maps</p>
          <p className="text-xs text-muted-foreground mt-1">Please check your API key configuration</p>
        </div>
        {/* Fallback to manual input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat-fallback">Latitude *</Label>
            <Input
              id="lat-fallback"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => onLocationChange(e.target.value, longitude)}
              placeholder="e.g., 28.6139"
            />
          </div>
          <div>
            <Label htmlFor="lng-fallback">Longitude *</Label>
            <Input
              id="lng-fallback"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => onLocationChange(latitude, e.target.value)}
              placeholder="e.g., 77.2090"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location (e.g., Andheri, Mumbai)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGetCurrentLocation}
          title="Use my current location"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={markerPosition ? 15 : 5}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
        
        {/* Instructions overlay */}
        {!markerPosition && (
          <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 inline mr-1" />
              Click on the map to place a pin or search for a location
            </p>
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {markerPosition && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Latitude: </span>
              <span className="font-medium">{latitude}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude: </span>
              <span className="font-medium">{longitude}</span>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Drag the pin to adjust the exact location of your property
      </p>
    </div>
  );
};

export default LocationPicker;