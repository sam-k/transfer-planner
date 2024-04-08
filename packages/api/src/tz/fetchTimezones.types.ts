/** Type for query params used in the `/tz` endpoint. */
export interface FetchTimezonesParams {
  /** Latitude of the coordinates for which to find the timezone. */
  lat: string;
  /** Longitude of the coordinates for which to find the timezone. */
  lon: string;
}
