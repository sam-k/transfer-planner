import {StyledEngineProvider} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {AppContextProvider} from '../AppContext';
import type {AppProps} from './App.types';
import BaseMap from './BaseMap';
import Sidebar from './Sidebar';

/** Renders the main application. */
const App = (props: AppProps) => {
  const {tileApi, searchApi, ...additionalProps} = props;

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
      <AppContextProvider currentPos={currentPos} {...additionalProps}>
        <Sidebar searchApi={searchApi} />
        <BaseMap tileApi={tileApi} />
      </AppContextProvider>
    </StyledEngineProvider>
  );
};

export default App;
