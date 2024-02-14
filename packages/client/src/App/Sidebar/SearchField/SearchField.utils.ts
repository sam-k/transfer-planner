import {uniqWith} from 'lodash-es';

import {parseAndCheckFloat} from '../../../utils';
import type {SearchApi} from '../../App.types';
import type {
  FoursquareAutocompleteResponse,
  NominatimSearchResponse,
  SearchResult,
} from './SearchField.types';

/** Time to wait when debouncing a search request, in milliseconds. */
export const DEBOUNCE_MS = 1000;

/**
 * Transforms an Autocomplete response from Fourquare into standardized search
 * results.
 */
const transformFoursquareAutocompleteResponse = (
  response: FoursquareAutocompleteResponse
): SearchResult[] =>
  response.results
    // Exclude place queries and regions.
    ?.filter(({type}) => type === 'place' || type === 'address')
    // Exclude individual apartment units.
    .filter(result => !/Apt\s[^\s]+$/.test(result.text?.primary ?? ''))
    .map(result => {
      return {
        // TODO: Support proper attribution.
        attribution: 'Powered by Foursquare. https://foursquare.com/',
        label: result.text?.primary ?? '',
        // Format `City State Zipcode` to `City, State`.
        description:
          result.text?.secondary?.replace(/\s([A-Z]+)\s\d+$/, ', $1') ?? '',
        fullName: [result.text?.primary, result.text?.secondary]
          .filter(Boolean)
          .join(', '),
      };
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
    .map(place => {
      const {
        licence,
        lat,
        lon,
        name,
        display_name,
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
        } = {},
      } = place;

      const label = name || [house_number, road].filter(Boolean).join(' ');
      const description = [
        name && road,
        neighbourhood ||
          allotments ||
          quarter ||
          hamlet ||
          croft ||
          isolated_dwelling,
        city || town || village || municipality,
        state || state_district || region,
      ]
        .filter(Boolean)
        .join(', ');

      return {
        attribution: licence ?? '',
        label,
        description,
        fullName: display_name ?? '',
        latitude: parseAndCheckFloat(lat),
        longitude: parseAndCheckFloat(lon),
      };
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
      searchResults = transformFoursquareAutocompleteResponse(
        responseJson as FoursquareAutocompleteResponse
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
