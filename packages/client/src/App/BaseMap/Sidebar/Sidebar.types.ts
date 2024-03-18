/** Location search result, with the matched query highlighted. */
export type HighlightedSearchResult = Pick<
  LocationInfo,
  'label' | 'description' | 'attribution'
> &
  Partial<Pick<LocationInfo, 'address' | 'latitude' | 'longitude'>> & {
    /** Some unique identifier for this search result. */
    id: string;
    /** Identifier for this search result from the search API. */
    apiId?: string;
    /** Index ranges for which substrings were matched from the search query. */
    matchedRanges: Array<[number, number]>;
  };

/** Information about a fetched location. */
export interface LocationInfo {
  /** Label of this location, usually the place name or the street number. */
  label: string;
  /** Description of this location, usually the remaining full address. */
  description: string;
  /** Full address of this location. */
  address: string;
  /** Latitude of this location. */
  latitude: number;
  /** Longitude of this location. */
  longitude: number;
  /** Attribution for how this location information was obtained. */
  attribution: string;
}
