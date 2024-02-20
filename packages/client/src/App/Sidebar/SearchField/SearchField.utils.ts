import {uniqWith} from 'lodash-es';

import {parseAndCheckFloat} from '../../../utils';
import type {SearchApi} from '../../App.types';
import type {
  FsqAutocompleteResponse,
  NominatimSearchResponse,
  SearchResult,
} from './SearchField.types';

/**
 * Transforms an Autocomplete response from Fourquare into standardized search
 * results.
 */
const transformFsqAutocompleteResponse = (
  response: FsqAutocompleteResponse
): SearchResult[] =>
  response.results
    // Exclude place queries and regions.
    ?.filter(({type}) => type === 'place' || type === 'address')
    // Exclude individual apartment units.
    .filter(result => !/Apt\s[^\s]+$/.test(result.text?.primary ?? ''))
    .map(result => {
      const {
        text: {primary, secondary} = {},
        place: {
          fsq_id,
          location: {
            address: streetAddress = undefined,
            locality = undefined,
            region = undefined,
            postcode = undefined,
          } = {},
          geocodes: {
            main: {latitude = undefined, longitude = undefined} = {},
          } = {},
        } = {},
        address: {address_id} = {},
      } = result;

      const apiId = fsq_id || address_id;

      const address =
        [[streetAddress, locality, region].filter(Boolean).join(', '), postcode]
          .filter(Boolean)
          .join(' ') || undefined;

      return {
        id: apiId || self.crypto.randomUUID(),
        apiId,
        label: primary ?? '',
        // Format `City State Zipcode` to `City, State`.
        description: secondary?.replace(/,?\s([A-Z]+)\s\d+$/, ', $1') ?? '',
        address,
        latitude,
        longitude,
        // TODO: Support proper attribution.
        attribution: 'Powered by Foursquare. https://foursquare.com/',
      } satisfies SearchResult;
    }) ?? [];

/**
 * Transforms a JSONv2 search response from Nominatim into standardized search
 * results.
 */
const transformNominatimSearchResponse = (
  response: NominatimSearchResponse
): SearchResult[] =>
  response
    // Exclude regions.
    .filter(({osm_type}) => osm_type !== 'relation')
    .map(result => {
      const {
        name,
        address: {
          house_number,
          road,
          neighbourhood,
          allotments,
          quarter,
          hamlet,
          croft,
          isolated_dwelling,
          city,
          town,
          village,
          municipality,
          state,
          state_district,
          region,
          postcode,
        } = {},
        lat,
        lon,
        place_id,
        licence,
      } = result;

      const apiId = place_id?.toString();

      const resolvedNeighborhood =
        neighbourhood ||
        allotments ||
        quarter ||
        hamlet ||
        croft ||
        isolated_dwelling;
      const resolvedLocality = city || town || village || municipality;
      const resolvedRegion = state || state_district || region;

      const label = name || [house_number, road].filter(Boolean).join(' ');
      const description = [
        name && road,
        resolvedNeighborhood,
        resolvedLocality,
        resolvedRegion,
      ]
        .filter(Boolean)
        .join(', ');
      const address = [
        [
          [house_number, road].filter(Boolean).join(' '),
          resolvedLocality,
          resolvedRegion,
        ]
          .filter(Boolean)
          .join(', '),
        postcode,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: apiId || self.crypto.randomUUID(),
        apiId,
        label,
        description,
        address,
        latitude: parseAndCheckFloat(lat),
        longitude: parseAndCheckFloat(lon),
        attribution: licence ?? '',
      } satisfies SearchResult;
    });

/**
 * Transforms a search response into standardized results, based on the search
 * API used.
 */
export const transformSearchResponse = (
  searchApi: SearchApi | undefined,
  responseJson: unknown
): SearchResult[] => {
  let searchResults;
  switch (searchApi) {
    case 'foursquare':
      searchResults = transformFsqAutocompleteResponse(
        responseJson as FsqAutocompleteResponse
      );
      break;
    case 'nominatim':
    default:
      searchResults = transformNominatimSearchResponse(
        responseJson as NominatimSearchResponse
      );
      break;
  }

  return uniqWith(
    searchResults.filter((result): result is SearchResult => Boolean(result)),
    // Try to dedupe results.
    (a, b) => a.label === b.label && a.description === b.description
  );
};
