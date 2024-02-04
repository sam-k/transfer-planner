import {escapeRegExp} from 'lodash-es';

interface ParamLookup {
  value: string;
  startIndex: number;
  endIndex: number;
}

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
    .sort(({startIndex: aIndex}, {startIndex: bIndex}) => aIndex - bIndex);

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
