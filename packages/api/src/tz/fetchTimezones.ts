import {find as findTimezone} from 'geo-tz';

import type {FetchTimezonesParams} from './fetchTimezones.types';

/**
 * Fetches timezones corresponding to the given coordinates.
 *
 * This is performed on the server to avoid bundling the large `geo-tz` package
 * in the client.
 */
const fetchTimezones = ({lat, lon}: FetchTimezonesParams): string[] => {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return [];
  }
  return findTimezone(latNum, lonNum);
};

export default fetchTimezones;
