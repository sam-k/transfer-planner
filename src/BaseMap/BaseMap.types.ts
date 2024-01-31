import type {LatLngBoundsLiteral} from 'leaflet';

export interface BaseMapProps {
  tileServer?: 'mapbox' | 'osm';
  boundingBox?: LatLngBoundsLiteral;
}
