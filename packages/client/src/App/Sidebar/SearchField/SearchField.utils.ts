import {uniqWith} from 'lodash-es';

import type {NominatimJSONv2Response, SearchResult} from './SearchField.types';

/** Time to wait when debouncing a search request, in milliseconds. */
export const DEBOUNCE_MS = 1000;

/**
 * Transforms a JSONv2 search response from Nominatim into standardized search
 * results.
 */
export const transformNominatimJSONv2Response = (
  response: NominatimJSONv2Response
): SearchResult[] =>
  uniqWith(
    response
      .map(place => {
        const {
          licence,
          osm_type,
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

        if (osm_type !== 'node' && osm_type !== 'way') {
          // Disallow any OSM regions.
          return undefined;
        }

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
          latitude: parseFloat(lat ?? '') || 0,
          longitude: parseFloat(lon ?? '') || 0,
          fullName: display_name ?? '',
        };
      })
      .filter((result): result is SearchResult => Boolean(result)),
    (a, b) => a.label === b.label && a.description === b.description
  );
