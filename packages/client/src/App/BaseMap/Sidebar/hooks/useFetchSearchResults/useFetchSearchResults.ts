import {ENV_VARS, SERVER_PORT} from '@internal/constants';
import {useMemo, useState} from 'react';

import type {LatLngCoords} from '../../../../../types';
import {
  areCoordsInBounds,
  debounceAsync,
  filterAndJoin,
  getHaversineDistKm,
} from '../../../../../utils';
import {useBaseMapContext} from '../../../../BaseMapContext';
import type {
  SearchResult,
  UseFetchSearchResultsProps,
} from './useFetchSearchResults.types';
import {
  currentPosSearchResult,
  transformSearchResponse,
} from './useFetchSearchResults.utils';

/** Time to wait when debouncing a request, in milliseconds. */
const DEBOUNCE_MS = 1500;

/** Provides tools for fetching search results from a query. */
const useFetchSearchResults = (props: UseFetchSearchResultsProps) => {
  const {allowSearchingCurrentPos} = props;

  const {searchApi, currentPos, boundingBox} = useBaseMapContext();

  // Whether we're currently fetching search results.
  const [isFetching, setIsFetching] = useState(false);

  /**
   * Radius centered at the current position, encompassing the map's bounding
   * box, in meters. This is for when the bounding box itself cannot be supplied
   * to an API.
   */
  const boundingRadiusM = useMemo(() => {
    if (!currentPos?.coords || !boundingBox) {
      // No radius to calculate.
      return undefined;
    }

    const currentCoords: LatLngCoords = [
      currentPos.coords.latitude,
      currentPos.coords.longitude,
    ];
    if (!areCoordsInBounds(currentCoords, boundingBox)) {
      // Current position lies outside the bounding box.
      return undefined;
    }

    const [[latBound1, lonBound1], [latBound2, lonBound2]] = boundingBox;
    const maxDistKm = Math.max(
      getHaversineDistKm(currentCoords, [latBound1, lonBound1]),
      getHaversineDistKm(currentCoords, [latBound1, lonBound2]),
      getHaversineDistKm(currentCoords, [latBound2, lonBound1]),
      getHaversineDistKm(currentCoords, [latBound2, lonBound2])
    );
    return Math.round(maxDistKm * 1000); // Convert to m
  }, [currentPos, boundingBox]);

  /** Encoded fetch URL with the URI param `query`. */
  const encodedFetchSearchData = useMemo(() => {
    let baseUrl: string;
    let uriParams: string[];
    let options: {} | undefined = undefined;

    switch (searchApi) {
      case 'foursquare': {
        baseUrl = 'https://api.foursquare.com/v3/autocomplete';
        uriParams = [
          currentPos?.coords.latitude &&
          currentPos?.coords.longitude &&
          boundingRadiusM
            ? [
                `ll=${encodeURIComponent(
                  [
                    currentPos.coords.latitude,
                    currentPos.coords.longitude,
                  ].join(',')
                )}`,
                `radius=${boundingRadiusM}`,
              ].join('&')
            : '',
          'query={query}',
        ];
        options = {
          headers: {
            Authorization: ENV_VARS.fsqApiKey,
          },
        };
        break;
      }

      case 'nominatim':
      default:
        baseUrl = 'https://nominatim.openstreetmap.org/search';
        uriParams = [
          'format=jsonv2',
          'addressdetails=1',
          boundingBox
            ? `viewbox=${encodeURIComponent(
                // Convert latitude-longitude pairs to X-Y pairs.
                boundingBox.flatMap(([lat, lon]) => [lon, lat]).join(',')
              )}`
            : '',
          'bounded=1',
          'q={query}',
        ];
        break;
    }

    const uriParamsStr = filterAndJoin(uriParams, /* sep= */ '&');
    const fullUrl = baseUrl + (uriParamsStr ? `?${uriParamsStr}` : '');
    return {
      encodedUrl: encodeURIComponent(fullUrl),
      encodedOptions: options && encodeURIComponent(JSON.stringify(options)),
    };
  }, [
    searchApi,
    currentPos?.coords.latitude,
    currentPos?.coords.longitude,
    boundingBox,
    boundingRadiusM,
  ]);

  /** Fetches search results for the provided query. */
  const fetchSearchResults = useMemo(
    () =>
      debounceAsync(
        async (query: string): Promise<SearchResult[]> => {
          if (
            allowSearchingCurrentPos &&
            query.toLocaleLowerCase() ===
              currentPosSearchResult.label.toLocaleLowerCase()
          ) {
            return [currentPosSearchResult];
          }

          const {encodedUrl, encodedOptions} = encodedFetchSearchData;
          const responseJson = await (
            await fetch(
              `http://localhost:${SERVER_PORT}/fetch?` +
                filterAndJoin(
                  [
                    `encodedUrl=${encodedUrl}`,
                    encodedOptions ? `encodedOptions=${encodedOptions}` : '',
                    `query=${encodeURIComponent(query)}`,
                  ],
                  /* sep= */ '&'
                )
            )
          ).json();

          return transformSearchResponse(searchApi, responseJson);
        },
        DEBOUNCE_MS,
        {
          leadingCallback: () => {
            setIsFetching(true);
          },
          trailingCallback: () => {
            setIsFetching(false);
          },
        }
      ),
    [searchApi, allowSearchingCurrentPos, encodedFetchSearchData]
  );

  return {isFetching, fetchSearchResults};
};

export default useFetchSearchResults;
