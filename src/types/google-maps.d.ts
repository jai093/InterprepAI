
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      setCenter(center: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      getBounds(): LatLngBounds | undefined;
      addListener(event: string, handler: (...args: any[]) => void): MapsEventListener;
      setFog(options: FogOptions): void;
      easeTo(options: any): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | null;
      setMap(map: Map | null): void;
      addListener(event: string, handler: (...args: any[]) => void): MapsEventListener;
    }

    class SearchBox {
      constructor(input: HTMLInputElement | HTMLTextAreaElement);
      setBounds(bounds: LatLngBounds): void;
      getPlaces(): Place[];
      addListener(event: string, handler: (...args: any[]) => void): MapsEventListener;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    class NavigationControl {
      constructor(options?: NavigationControlOptions);
    }

    interface NavigationControlOptions {
      visualizePitch?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
      animation?: Animation;
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral;
      zoom: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface FogOptions {
      color?: string;
      'high-color'?: string;
      'horizon-blend'?: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
      toString(): string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBounds {
      contains(latLng: LatLng | LatLngLiteral): boolean;
      extend(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      toString(): string;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface Place {
      geometry?: {
        location?: LatLng;
      };
      formatted_address?: string;
      name?: string;
    }

    interface GeocoderRequest {
      location?: LatLng | LatLngLiteral;
      address?: string;
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
    }

    type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
    
    enum Animation {
      BOUNCE,
      DROP
    }

    namespace places {
      class SearchBox {
        constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
        setBounds(bounds: LatLngBounds): void;
        getPlaces(): Place[];
      }

      interface SearchBoxOptions {
        bounds?: LatLngBounds;
      }
    }
  }
}
