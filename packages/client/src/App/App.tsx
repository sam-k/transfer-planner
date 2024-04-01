import {OTP_GTFS_GRAPHQL_ENDPOINT} from '@internal/constants';
import {StyledEngineProvider} from '@mui/material';
import React, {memo} from 'react';
import {
  Client as UrqlClient,
  Provider as UrqlProvider,
  cacheExchange,
  fetchExchange,
} from 'urql';

import type {AppProps} from './App.types';
import BaseMap from './BaseMap';

const otpUrqlClient = new UrqlClient({
  url: OTP_GTFS_GRAPHQL_ENDPOINT,
  exchanges: [cacheExchange, fetchExchange],
});

/** Renders the main application. */
const App = (props: AppProps) => (
  <UrqlProvider value={otpUrqlClient}>
    <StyledEngineProvider injectFirst>
      <BaseMap {...props} />
    </StyledEngineProvider>
  </UrqlProvider>
);

export default memo(App);
