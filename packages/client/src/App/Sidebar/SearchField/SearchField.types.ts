import type {Dispatch, SetStateAction} from 'react';
import type {LocationInfo, SidebarProps} from '../Sidebar.types';

/** Type for props for the location search field. */
export interface SearchFieldProps extends Pick<SidebarProps, 'searchApi'> {
  /** */
  selectedValue: HighlightedSearchResult | null;
  /** */
  setSelectedValue: Dispatch<SetStateAction<HighlightedSearchResult | null>>;
}

/** Location search result. */
export type SearchResult = Pick<
  LocationInfo,
  'label' | 'description' | 'attribution'
> &
  Partial<Pick<LocationInfo, 'address' | 'latitude' | 'longitude'>> & {
    /** Some unique identifier for this search result. */
    id: string;
    /** Identifier for this search result from the search API. */
    apiId?: string;
  };

/**
 * Location search result, with information about which substrings to highlight.
 */
export interface HighlightedSearchResult extends SearchResult {
  /** Index ranges for which substrings were matched from the search query. */
  matchedRanges: Array<[number, number]>;
}

/**
 * Response from the Foursquare Autocomplete API. Includes only those fields
 * that may be relevant for this application.
 *
 * Abridged from https://location.foursquare.com/developer/reference/autocomplete-1.
 */
export interface FsqAutocompleteResponse {
  results?: Array<{
    type?: 'place' | 'address' | 'search' | 'geo';
    text?: {
      primary?: string;
      secondary?: string;
      highlight?: Array<{
        start?: number;
        length?: number;
      }>;
    };
    place?: {
      fsq_id?: string;
      categories?: Array<{
        id?: number;
        name?: string;
      }>;
      location?: {
        address?: string;
        locality?: string;
        region?: string;
        postcode?: string;
        country?: string;
      };
      geocodes?: {
        main?: {
          latitude?: number;
          longitude?: number;
        };
      };
    };
    address?: {
      address_id?: string;
    };
  }>;
}

/**
 * Response from the Nominatim `search` API, in JSONv2 format. Includes only
 * those fields that may be relevant for this application.
 *
 * Abridged from https://nominatim.org/release-docs/develop/api/Output/.
 *
 * Also see:
 * - https://wiki.openstreetmap.org/wiki/Elements
 * - https://wiki.openstreetmap.org/wiki/Key:place
 */
export type NominatimSearchResponse = Array<{
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
