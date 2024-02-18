import type {FsqAddressDetailsResponse, LocationResult} from './Infobox.types';

/** */
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
    [[streetAddress, locality, region].filter(Boolean).join(', '), postcode]
      .filter(Boolean)
      .join(' ') || undefined;

  return {
    address: address ?? '',
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    // TODO: Support proper attribution.
    attribution: 'Powered by Foursquare. https://foursquare.com/',
  };
};
