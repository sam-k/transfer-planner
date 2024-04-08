import {escapeRegExp} from 'lodash-es';

/** Gets the query param regex for the given query `{key}`. */
const getQueryParamRegex = (key: string) =>
  new RegExp(`(?<!\\$){(${escapeRegExp(key)})}`, 'dg');
/** Regex for environment variables of form `${key}`. */
const ENV_VAR_REGEX = /\${([^${}]+)}/dg;

/** Type for lookup data for any query params included in the URL. */
interface ParamLookup {
  /** Value with which to replace the param. */
  value: string;
  /** Start index of the param in the URL. */
  startIndex: number;
  /** End index of the param in the URL. */
  endIndex: number;
}

/**
 * Match a query param in the URL with associated lookup information.
 *
 * @param url Decoded URL
 * @param pattern Regex pattern for the query param
 * @param getValue Getter for the value with which to replace the param
 * @returns Lookup data, sorted in order of appearance in the URL
 */
const matchParamLookups = (
  url: string,
  pattern: RegExp,
  getValue: (key: string) => string
): ParamLookup[] =>
  Array.from(url.matchAll(pattern), (match): ParamLookup => {
    const [, key] = match;
    const [[startIndex, endIndex]] = match.indices ?? [[-1, -1]];
    return {
      value: getValue(key),
      startIndex,
      endIndex,
    };
  });

/** Replace elements in a string without overwriting previous replacements. */
const replaceParamsAtOnce = (
  originalStr: string,
  paramLookups: ParamLookup[]
) => {
  let populatedStr = '';
  let restStr = originalStr;
  let prevEndIndex = 0;

  for (const {value, startIndex, endIndex} of paramLookups) {
    populatedStr += restStr.slice(0, startIndex - prevEndIndex) + value;
    restStr = restStr.slice(endIndex - prevEndIndex);
    prevEndIndex = endIndex;
  }
  populatedStr += restStr;

  return populatedStr;
};

/**
 * Fetch response from the URL with populated query params and environment
 * variables.
 */
const fetchWithQuery = async ({
  encodedUrl,
  encodedOptions,
  encodedQueryParams,
}: {
  encodedUrl: string;
  encodedOptions?: string;
  encodedQueryParams: Record<string, string>;
}) => {
  if (!encodedUrl) {
    throw new Error('URL cannot be empty.');
  }

  const url = decodeURIComponent(encodedUrl);
  const paramLookups: ParamLookup[] = [
    // Query param keys are specified in the request.
    ...Object.entries(encodedQueryParams).flatMap(([key, value]) =>
      matchParamLookups(url, getQueryParamRegex(key), () =>
        encodeURIComponent(value)
      )
    ),
    ...matchParamLookups(url, ENV_VAR_REGEX, key => process.env[key] ?? ''),
  ]
    .filter(({startIndex}) => startIndex >= 0)
    .sort(({startIndex: a}, {startIndex: b}) => a - b);
  const populatedUrl = replaceParamsAtOnce(url, paramLookups);

  const populatedOptions = encodedOptions
    ? JSON.parse(decodeURIComponent(encodedOptions), (key, value) =>
        typeof value === 'string'
          ? replaceParamsAtOnce(
              value,
              matchParamLookups(
                value,
                ENV_VAR_REGEX,
                key => process.env[key] ?? ''
              )
            )
          : value
      )
    : undefined;

  return await fetch(populatedUrl, populatedOptions);
};

export default fetchWithQuery;
