import {StyledEngineProvider} from '@mui/material';
import React, {memo} from 'react';

import type {AppProps} from './App.types';
import BaseMap from './BaseMap';

/** Renders the main application. */
const App = (props: AppProps) => (
  <StyledEngineProvider injectFirst>
    <BaseMap {...props} />
  </StyledEngineProvider>
);

export default memo(App);
