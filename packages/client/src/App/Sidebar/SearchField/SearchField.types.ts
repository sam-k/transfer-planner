import type {SidebarProps} from '../Sidebar.types';

/** Type for props for the location search field. */
export type SearchFieldProps = Pick<SidebarProps, 'searchApi'>;

/** Location search result. */
export interface SearchResult {
  /** Attribution for how this search result was obtained. */
  attribution: string;
  /**
   * Label of this search result, usually the place name or the street number.
   */
  label: string;
  /** Description of this search result, usually the remaining full address. */
  description: string;
  /** Latitude of this location. */
  latitude: number;
  /** Longitude of this location. */
  longitude: number;
  /** Full name of this search result, usually the full address. */
  fullName: string;
}

/**
 * Location search result, with information about which substrings to highlight.
 */
export interface HighlightedSearchResult extends SearchResult {
  /** Index ranges for which substrings were matched from the search query. */
  matchedRanges: Array<[number, number]>;
}

/**
 * Response from the Nominatim `search` API, in JSONv2 format. Includes only
 * those fields that are relevant for this application.
 *
 * Abridged from https://nominatim.org/release-docs/develop/api/Output/.
 *
 * Also see:
 * - https://wiki.openstreetmap.org/wiki/Elements
 * - https://wiki.openstreetmap.org/wiki/Key:place
 */
export type NominatimJSONv2Response = Array<{
  place_id?: number;
  licence?: string;
  osm_type?: 'node' | 'relation' | 'way';
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  address?: {
    house_number?: string;
    road?: string;

    neighbourhood?: string;
    allotments?: string;
    quarter?: string;
    hamlet?: string;
    croft?: string;
    isolated_dwelling?: string;

    city?: string;
    town?: string;
    village?: string;
    municipality?: string;

    state?: string;
    state_district?: string;
    region?: string;

    postcode?: string;

    country?: string;
    country_code?: string;
  };

  boundingbox?: [string, string, string, string];

  [key: string]: unknown;
}>;
