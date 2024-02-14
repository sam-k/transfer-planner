import React, {useEffect, useState} from 'react';

import {AppContextProvider} from '../AppContext';
import type {AppProps} from './App.types';
import BaseMap from './BaseMap';
import Sidebar from './Sidebar';

/** Renders the main application. */
const App = (props: AppProps) => {
  const {tileApi, searchApi, boundingBox} = props;

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
    <AppContextProvider currentPos={currentPos} boundingBox={boundingBox}>
      <Sidebar searchApi={searchApi} />
      <BaseMap tileApi={tileApi} />
    </AppContextProvider>
  );
};

export default App;
