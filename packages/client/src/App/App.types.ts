import type {LatLngBoundsLiteral, LatLngTuple} from 'leaflet';

/** Supported tile APIs. */
export type TileApi = 'mapbox' | 'osm';

/** Supported location search APIs. */
export type SearchApi = 'foursquare' | 'nominatim';

/** Type for props for the main application. */
export interface AppProps {
  /**
   * Tile API to use for rendering the map.
   *
   * @default 'osm'
   */
  tileApi?: TileApi;
  /**
   * Location search API to use for searching input.
   *
   * @default 'nominatim'
   */
  searchApi?: SearchApi;
  /** Default center coordinates for the map. */
  defaultCenter?: LatLngTuple;
  /** Max bounds for the map. */
  boundingBox?: LatLngBoundsLiteral;
}
