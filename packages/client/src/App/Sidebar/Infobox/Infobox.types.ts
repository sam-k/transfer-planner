import type {SearchResult} from '../SearchField';
import type {LocationInfo, SidebarProps} from '../Sidebar.types';

/** Type for props for an infobox about a location. */
export interface InfoboxProps extends Pick<SidebarProps, 'searchApi'> {
  /** The search result corresponding to this location. */
  searchResult: SearchResult | null;
}

/** Location information result. */
export type LocationResult = Pick<
  LocationInfo,
  'address' | 'latitude' | 'longitude' | 'attribution'
>;

/**
 * Response from the Foursquare Address Details API. Includes only those fields
 * that may be relevant for this application.
 *
 * Abridged from https://location.foursquare.com/developer/reference/address-details.
 */
export interface FsqAddressDetailsResponse {
  fsq_addr_id?: string;
  location?: {
    address?: string;
    neighborhood?: string[];
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
}
