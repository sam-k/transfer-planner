import type {SearchResult} from '../SearchField';
import type {LocationInfo, SidebarProps} from '../Sidebar.types';

/** */
export interface InfoboxProps extends Pick<SidebarProps, 'searchApi'> {
  /** */
  searchResult: SearchResult;
}

/** */
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
export interface FoursquareAddressDetailsResponse {
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
