import type {QueryType, QueryTypePlanArgs} from '@internal/otp';
import {useMemo} from 'react';
import {useQuery} from 'urql';

import {normalizeOtpQueryResult} from '../utils';
import PLAN_QUERY from './directionsQuery';
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

  const [result, executeQuery] = useQuery<QueryType, QueryTypePlanArgs>({
    query: PLAN_QUERY,
    pause: !isQueryValid,
    variables: queryVars,
  });

  return {
    queryData: normalizeOtpQueryResult(result, /* queryType= */ 'plan'),
    executeQuery,
  };
};

export default useFetchDirections;
