import {writePrimitivesWithDecl} from '../utils';

/** Constants to use in this application's networking. */
const NETWORK_CONSTANTS = {
  CLIENT_PORT: {
    value: 5173,
    comment: 'Port to use for the client.',
  },
  API_PORT: {
    value: 3000,
    comment: 'Port to use for the API server.',
  },
  OTP_PORT: {
    value: 8080,
    comment: 'Port to use for the OpenTripPlanner server.',
  },
  API_FETCH_ENDPOINT_NAME: {
    value: 'fetch',
    comment: 'Name of the endpoint for fetching proxied responses from URLs.',
  },
  API_TZ_ENDPOINT_NAME: {
    value: 'tz',
    comment:
      'Name of the endpoint for fetching timezones for the given coordinates.',
  },
} as const;

export default () => {
  writePrimitivesWithDecl('network', [
    ...Object.entries(NETWORK_CONSTANTS).map(([name, data]) => ({
      name,
      ...data,
    })),
    {
      name: 'API_FETCH_ENDPOINT',
      value: `http://localhost:${NETWORK_CONSTANTS.API_PORT.value}/${NETWORK_CONSTANTS.API_FETCH_ENDPOINT_NAME.value}`,
      comment: 'Endpoint for fetching proxied responses from URLs.',
    },
    {
      name: 'API_TZ_ENDPOINT',
      value: `http://localhost:${NETWORK_CONSTANTS.API_PORT.value}/${NETWORK_CONSTANTS.API_TZ_ENDPOINT_NAME.value}`,
      comment: 'Endpoint for fetching timezones for the given coordinates.',
    },
    {
      name: 'OTP_GTFS_GRAPHQL_ENDPOINT',
      value: `http://localhost:${NETWORK_CONSTANTS.OTP_PORT.value}/otp/routers/default/index/graphql`,
      comment: 'Endpoint for the OpenTripPlanner GTFS GraphQL API.',
    },
  ]);
};
