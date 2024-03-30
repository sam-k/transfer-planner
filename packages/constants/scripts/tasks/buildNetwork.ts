import {writePrimitivesWithDecl} from '../utils';

/** Ports to use in this application. */
const PORTS = {
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
} as const;

export default () => {
  writePrimitivesWithDecl('network', [
    ...Object.entries(PORTS).map(([name, data]) => ({name, ...data})),
    {
      name: 'OTP_GTFS_GRAPHQL_ENDPOINT',
      value: `http://localhost:${PORTS.OTP_PORT.value}/otp/routers/default/index/graphql`,
      comment: 'Endpoint for the OpenTripPlanner GTFS GraphQL API.',
    },
  ]);
};
