import React from 'react';

import {AppContextProvider} from '../AppContext';
import type {AppProps} from './App.types';
import BaseMap from './BaseMap';
import Sidebar from './Sidebar';

/** Renders the main application. */
const App = (props: AppProps) => {
  const {tileApi, searchApi, boundingBox} = props;

  return (
    <AppContextProvider boundingBox={boundingBox}>
      <Sidebar searchApi={searchApi} />
      <BaseMap tileApi={tileApi} />
    </AppContextProvider>
  );
};

export default App;
