import {StyledEngineProvider} from '@mui/material';
import React, {memo, useEffect, useState} from 'react';

import {AppContextProvider} from '../AppContext';
import type {AppProps} from './App.types';
import BaseMap from './BaseMap';

/** Renders the main application. */
const App = (props: AppProps) => {
  const {tileApi, defaultCenter, ...additionalProps} = props;

  // Current position of the user device.
  const [currentPos, setCurrentPos] = useState<GeolocationPosition>();
  useEffect(() => {
    navigator.geolocation.watchPosition(
      pos => {
        setCurrentPos(pos);
      },
      err => {
        console.error(err);
      },
      {enableHighAccuracy: true}
    );
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <AppContextProvider
        currentPos={currentPos}
        {...{tileApi, ...additionalProps}}
      >
        <BaseMap tileApi={tileApi} defaultCenter={defaultCenter} />
      </AppContextProvider>
    </StyledEngineProvider>
  );
};

export default memo(App);
