import type {LatLngBoundsLiteral} from 'leaflet';

/** Type for props for the application's base map. */
export interface BaseMapProps {
  /** Tile server to use for rendering the map. */
  tileServer?: 'mapbox' | 'osm';
  /** Max bounds for the map. */
  boundingBox?: LatLngBoundsLiteral;
}
