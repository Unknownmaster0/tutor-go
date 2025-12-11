declare global {
  namespace google {
    namespace maps {
      interface MapOptions {
        zoom?: number;
        center?: LatLng | LatLngLiteral;
        mapTypeControl?: boolean;
        fullscreenControl?: boolean;
        streetViewControl?: boolean;
        zoomControl?: boolean;
      }

      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        icon?: string | Icon | SymbolOptions;
      }

      interface InfoWindowOptions {
        content?: string | Node;
        position?: LatLng | LatLngLiteral;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface Icon {
        path?: SymbolPath | string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      interface SymbolOptions {
        path: SymbolPath | string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      enum SymbolPath {
        CIRCLE = 'CIRCLE',
      }

      class LatLng {
        constructor(lat: number, lng: number);
      }

      class Map {
        constructor(container: HTMLElement, options?: MapOptions);
        fitBounds(bounds: LatLngBounds, padding?: number): void;
        setCenter(latlng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        getZoom(): number;
      }

      class Marker {
        constructor(options?: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng | LatLngLiteral): void;
        addListener(eventName: string, callback: (...args: unknown[]) => void): void;
      }

      class InfoWindow {
        constructor(options?: InfoWindowOptions);
        open(map?: Map | null, marker?: Marker): void;
        close(): void;
      }

      class LatLngBounds {
        extend(point: LatLng | LatLngLiteral): void;
      }
    }
  }
}

export {};
