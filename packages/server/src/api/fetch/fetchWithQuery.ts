import {escapeRegExp} from 'lodash-es';

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

/**
 * Fetch response from the URL with populated query params and environment
 * variables.
 */
export const fetchWithQuery = async (
  encodedUrl: string,
  encodedQueryParams: Record<string, string>
) => {
  if (!encodedUrl) {
    throw new Error('URL cannot be empty.');
  }

  const url = decodeURIComponent(encodedUrl);
  const paramsLookup: ParamLookup[] = [
    // Query params of form `{KEY}`, with keys specified in request.
    ...Object.entries(encodedQueryParams).flatMap(([key, encodedValue]) =>
      matchParamLookups(
        url,
        new RegExp(`(?<!\\$){(${escapeRegExp(key)})}`, 'dg'),
        () => decodeURIComponent(encodedValue)
      )
    ),
    // Any environment variables of form `${KEY}`.
    ...matchParamLookups(url, /\${([^${}]+)}/dg, key => process.env[key] ?? ''),
  ]
    .filter(({startIndex}) => startIndex >= 0)
    .sort(({startIndex: a}, {startIndex: b}) => a - b);

  // Replace without overwriting previous replacements.
  let populatedUrl = '';
  let restUrl = url;
  let prevEndIndex = 0;
  for (const {value, startIndex, endIndex} of paramsLookup) {
    populatedUrl += restUrl.slice(0, startIndex - prevEndIndex) + value;
    restUrl = restUrl.slice(endIndex - prevEndIndex);
    prevEndIndex = endIndex;
  }
  populatedUrl += restUrl;

  return await fetch(populatedUrl);
};
