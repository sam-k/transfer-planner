/** Type for query params used in the `/fetch` endpoint. */
export interface FetchWithQueryParams {
  encodedUrl: string;
  encodedOptions: string;
  [key: string]: string;
}
