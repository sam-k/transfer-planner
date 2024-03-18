import {useCallback, useMemo, useState} from 'react';

import {API_SERVER_URL, ENV_VARS} from '../../../../../constants';
import {filterAndJoin} from '../../../../../utils';
import {useBaseMapContext} from '../../../../BaseMapContext';
import type {LocationInfo} from '../../Sidebar.types';
import {
  currentPosSearchResult,
  type SearchResult,
} from '../useFetchSearchResults';
import {transformFsqAddressDetailsResponse} from './useFetchLocationInfo.utils';

/** Provides tools for fetching location information from a search result. */
const useFetchLocationInfo = () => {
  const {searchApi, currentPos} = useBaseMapContext();

  // Whether we're currently fetching a location.
  const [isFetching, setIsFetching] = useState(false);

  /** Encoded fetch URL with the param `id`. */
  const encodedFetchLocationData = useMemo(() => {
    let url = '';
    let options: {} | undefined = undefined;

    switch (searchApi) {
      case 'foursquare': {
        url = 'https://api.foursquare.com/v3/address/{id}';
        options = {
          headers: {
            Authorization: ENV_VARS.fsqApiKey,
          },
        };
        break;
      }

      case 'nominatim':
      default:
        break;
    }

    return {
      encodedUrl: encodeURIComponent(url),
      encodedOptions: options && encodeURIComponent(JSON.stringify(options)),
    };
  }, [searchApi]);

  /** Fetches location information for the provided search result. */
  const fetchLocationInfo = useCallback(
    async (searchResult: SearchResult): Promise<LocationInfo> => {
      setIsFetching(true);

      if (currentPos && searchResult.id === currentPosSearchResult.id) {
        setIsFetching(false);
        return {
          ...searchResult,
          address: '',
          latitude: currentPos?.coords.latitude,
          longitude: currentPos?.coords.longitude,
        };
      }

      let locationInfo: LocationInfo = {
        label: searchResult.label,
        description: searchResult.description,
        address: searchResult.address ?? '',
        latitude: searchResult.latitude ?? 0,
        longitude: searchResult.longitude ?? 0,
        attribution: searchResult.attribution,
      };

      switch (searchApi) {
        case 'foursquare': {
          if (
            searchResult.address &&
            searchResult.latitude !== undefined &&
            searchResult.longitude !== undefined
          ) {
            // Some Foursquare search results already include coordinates.
            break;
          }
          const {encodedUrl, encodedOptions} = encodedFetchLocationData;
          const responseJson = await (
            await fetch(
              `${API_SERVER_URL}/fetch?` +
                filterAndJoin(
                  [
                    `encodedUrl=${encodedUrl}`,
                    encodedOptions ? `encodedOptions=${encodedOptions}` : '',
                    `id=${encodeURIComponent(searchResult.apiId ?? '')}`,
                  ],
                  /* sep= */ '&'
                )
            )
          ).json();
          locationInfo = {
            ...locationInfo,
            ...transformFsqAddressDetailsResponse(responseJson),
          };
          break;
        }

        case 'nominatim':
        default:
          // Nominatim search results already include coordinates.
          break;
      }

      setIsFetching(false);
      return locationInfo;
    },
    [searchApi, currentPos, encodedFetchLocationData]
  );

  return {isFetching, fetchLocationInfo};
};

export default useFetchLocationInfo;
