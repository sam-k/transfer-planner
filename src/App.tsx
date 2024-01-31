import React from 'react';

import BaseMap from './BaseMap';

const App = () => (
  <>
    <BaseMap
      tileServer="osm"
      // TODO: Read from config instead of hardcoding.
      boundingBox={[
        [36.791, -123.64],
        [38.719, -121.025],
      ]}
    />
  </>
);

export default App;
