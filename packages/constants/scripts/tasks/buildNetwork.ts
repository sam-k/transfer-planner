import {writePrimitivesWithDecl} from '../utils';

export default () => {
  writePrimitivesWithDecl('network', [
    {
      name: 'CLIENT_PORT',
      value: 5173,
      comment: 'Port to use for the client.',
    },
    {
      name: 'API_PORT',
      value: 3000,
      comment: 'Port to use for the API server.',
    },
    {
      name: 'OTP_PORT',
      value: 8080,
      comment: 'Port to use for the OpenTripPlanner server.',
    },
  ]);
};
