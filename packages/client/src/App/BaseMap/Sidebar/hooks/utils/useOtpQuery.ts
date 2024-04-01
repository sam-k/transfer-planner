import type {QueryType} from '@internal/otp';
import {useMemo} from 'react';
import {useQuery, type TypedDocumentNode} from 'urql';

/** Type for name of an OTP query. */
export type OtpQueryName = Exclude<keyof QueryType, `__${string}`>;

/** Type for an OTP GTFS GraphQL document. */
export type OtpQueryDocument<
  TQueryName extends OtpQueryName,
  TQueryVars extends {},
> = TypedDocumentNode<Pick<QueryType, TQueryName>, TQueryVars>;

/** Provides tools for fetching data through an OTP GTFS GraphQL query. */
const useOtpQuery = <TQueryName extends OtpQueryName, TQueryVars extends {}>({
  name,
  query,
  vars,
  isQueryValid,
}: {
  /** Name of the query. */
  name: TQueryName;
  /** GraphQL document for this query. */
  query: OtpQueryDocument<TQueryName, TQueryVars>;
  /** Variables to supply to this query. */
  vars: TQueryVars;
  /** Whether this query is valid and should be run. */
  isQueryValid?: boolean;
}) => {
  const [result, executeQuery] = useQuery<
    Pick<QueryType, TQueryName>,
    TQueryVars
  >({
    query,
    pause: !isQueryValid,
    variables: vars,
  });

  /**
   * Normalized data from the query result, or `null` if result is empty or not
   * ready.
   */
  const normalizedData = useMemo<QueryType[TQueryName] | null>(() => {
    if (result.stale || result.fetching || !result.data) {
      return null;
    }
    return result.data[name];
  }, [result, name]);

  return {
    queryData: normalizedData,
    executeQuery,
  };
};

export default useOtpQuery;
