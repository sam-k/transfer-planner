import type {LocationInfo} from '../../Sidebar.types';

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
