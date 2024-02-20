/**
 * URL for the local API server.
 *
 * TODO: Fetch port instead of hardcoding.
 */
export const API_SERVER_URL = 'http://localhost:3000';

/**
 * Names of environment variables used by this application, in form `${name}`.
 */
export const ENV_VARS = {
  fsqApiKey: '${FSQ_API_KEY}',
  mapboxApiKey: '${MAPBOX_API_KEY}',
} as const;

/** Time to wait when debouncing a request, in milliseconds. */
export const DEBOUNCE_MS = 1500;
