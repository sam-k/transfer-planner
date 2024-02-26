import {filterAndJoin} from '../../../../utils';
import type {FsqAddressDetailsResponse, LocationResult} from './Infobox.types';

/**
 * Transforms an Address Details response from Fourquare into a standardized
 * location information result.
 */
export const transformFsqAddressDetailsResponse = (
  response: FsqAddressDetailsResponse
): LocationResult => {
  const {
    location: {
      address: streetAddress = undefined,
      locality = undefined,
      region = undefined,
      postcode = undefined,
    } = {},
    geocodes: {main: {latitude = undefined, longitude = undefined} = {}} = {},
  } = response;

  const address =
    filterAndJoin(
      [
        filterAndJoin([streetAddress, locality, region], /* sep= */ ', '),
        postcode,
      ],
      /* sep= */ ' '
    ) || undefined;

  return {
    address: address ?? '',
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    // TODO: Support proper attribution.
    attribution: 'Powered by Foursquare. https://foursquare.com/',
  };
};
