import type {QueryTypePlanArgs} from '@internal/otp';
import {useMemo} from 'react';

import {useOtpQuery} from '../utils';
import {PLAN_QUERY_DOCUMENT, PLAN_QUERY_NAME} from './directionsQuery';
import type {UseFetchDirectionsProps} from './useFetchDirections.types';

/** Fetches transit directions between two locations. */
const useFetchDirections = (props: UseFetchDirectionsProps) => {
  const {startLocation, endLocation} = props;

  /** Whether the query is valid to be run. */
  const isQueryValid = useMemo(
    () => Boolean(startLocation && endLocation),
    [startLocation, endLocation]
  );

  /** Variables to supply to the query. */
  const queryVars = useMemo<QueryTypePlanArgs>(() => {
    if (!isQueryValid) {
      return {};
    }
    return {
      from: {
        lat: startLocation!.latitude,
        lon: startLocation!.longitude,
      },
      to: {
        lat: endLocation!.latitude,
        lon: endLocation!.longitude,
      },
    };
  }, [startLocation, endLocation, isQueryValid]);

  return useOtpQuery({
    name: PLAN_QUERY_NAME,
    query: PLAN_QUERY_DOCUMENT,
    vars: queryVars,
    isQueryValid,
  });
};

export default useFetchDirections;
