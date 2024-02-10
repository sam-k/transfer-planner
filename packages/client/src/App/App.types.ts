import type {LatLngBoundsLiteral} from 'leaflet';

/** Type for props for the main application. */
export interface AppProps {
  /**
   * Tile API to use for rendering the map.
   *
   * @default 'osm'
   */
  tileApi?: 'mapbox' | 'osm';
  /**
   * Location search API to use for searching input.
   *
   * @default 'nominatim'
   */
  searchApi?: 'nominatim';
  /** Max bounds for the map. */
  boundingBox?: LatLngBoundsLiteral;
}
