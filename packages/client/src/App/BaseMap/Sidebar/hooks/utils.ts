import type {QueryType} from '@internal/otp';
import type {UseQueryState} from 'urql';

/**
 * Normalizes a query result from the OpenTripPlanner GTFS GraphQL API through
 * URQL.
 *
 * @returns Resulting data, or `null` if result is empty or not ready
 */
export const normalizeOtpQueryResult = <
  TQueryType extends Exclude<keyof QueryType, `__${string}`>,
  TQueryTypeArgs extends {},
>(
  result: UseQueryState<QueryType, TQueryTypeArgs>,
  queryType: TQueryType
): QueryType[TQueryType] | null => {
  if (result.stale || result.fetching || !result.data) {
    return null;
  }
  return result.data[queryType];
};
