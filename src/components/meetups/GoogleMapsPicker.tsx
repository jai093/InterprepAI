
import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleMapsPickerProps {
  onLocationSelect: (location: string, coords: { lat: number; lng: number }) => void;
  initialLocation?: string;
}

const GoogleMapsPicker = ({ onLocationSelect, initialLocation }: GoogleMapsPickerProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || "");
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when shown
  useEffect(() => {
    if (mapLoaded && showMap && mapRef.current) {
      const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco
      
      const mapOptions = {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      };
      
      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      
      const marker = new google.maps.Marker({
        position: defaultLocation,
        map,
        draggable: true,
        animation: google.maps.Animation.DROP
      });
      markerRef.current = marker;
      
      // Initialize search box
      const input = document.getElementById("map-search-input") as HTMLInputElement;
      const searchBox = new google.maps.places.SearchBox(input);
      
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
      });
      
      // Listen for search results
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (!places || places.length === 0) return;
        
        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;
        
        // Center map on selected place
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        
        // Update marker
        marker.setPosition(place.geometry.location);
        
        // Update selected location
        const location = place.formatted_address || place.name;
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setSelectedLocation(location);
        setSelectedCoords(coords);
        onLocationSelect(location, coords);
      });
      
      // Update marker position when dragged
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (position) {
          const coords = { lat: position.lat(), lng: position.lng() };
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation(address);
              setSelectedCoords(coords);
              onLocationSelect(address, coords);
            }
          });
        }
      });
    }
  }, [mapLoaded, showMap, onLocationSelect]);

  const toggleMap = () => {
    setShowMap(prev => !prev);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          id="map-search-input"
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Search for a location"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={toggleMap}>
          <MapPin className="h-4 w-4 mr-2" />
          {showMap ? "Hide Map" : "Show Map"}
        </Button>
      </div>
      
      {showMap && (
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-md border border-input mt-2"
        />
      )}
      
      {!mapLoaded && showMap && (
        <div className="w-full h-64 rounded-md border border-input mt-2 flex items-center justify-center bg-muted">
          <p>Loading map...</p>
        </div>
      )}
      
      {selectedLocation && (
        <p className="text-sm text-muted-foreground mt-1 truncate">
          Selected: {selectedLocation}
        </p>
      )}
    </div>
  );
};

export default GoogleMapsPicker;
