import {API_TZ_ENDPOINT} from '@internal/constants';
import {useCallback} from 'react';

import type {LatLngCoords} from '../../../../../types';

/** Provides tools for fetching timezone from coordinates. */
const useFetchTimezone = () => {
  /** Fetches timezone from the given coordinates. */
  const fetchTimezone = useCallback(
    async ([lat, lon]: LatLngCoords): Promise<string | undefined> =>
      (
        await (
          await fetch(
            [API_TZ_ENDPOINT, [`lat=${lat}`, `lon=${lon}`].join('&')].join('?')
          )
        ).json()
      ).timezones?.[0],
    []
  );

  return {fetchTimezone};
};

export default useFetchTimezone;
