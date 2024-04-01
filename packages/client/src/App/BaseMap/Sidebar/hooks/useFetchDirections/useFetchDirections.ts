import type {QueryTypePlanArgs} from '@internal/otp';
import {useMemo} from 'react';

import {useOtpQuery} from '../utils';
import {PLAN_QUERY_DOCUMENT, PLAN_QUERY_NAME} from './directionsQuery';
import type {UseFetchDirectionsProps} from './useFetchDirections.types';

/** Fetches transit directions between two locations. */
const useFetchDirections = (props: UseFetchDirectionsProps) => {
  const {fromLocation, toLocation} = props;

  /** Whether the query is valid to be run. */
  const isQueryValid = useMemo(
    () => Boolean(fromLocation && toLocation),
    [fromLocation, toLocation]
  );

  /** Variables to supply to the query. */
  const queryVars = useMemo<QueryTypePlanArgs>(() => {
    if (!isQueryValid) {
      return {};
    }
    return {
      from: {
        lat: fromLocation!.latitude,
        lon: fromLocation!.longitude,
      },
      to: {
        lat: toLocation!.latitude,
        lon: toLocation!.longitude,
      },
    };
  }, [fromLocation, toLocation, isQueryValid]);

  return useOtpQuery({
    name: PLAN_QUERY_NAME,
    query: PLAN_QUERY_DOCUMENT,
    vars: queryVars,
    isQueryValid,
  });
};

export default useFetchDirections;
