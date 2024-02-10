import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      tileApi="osm"
      searchApi="nominatim"
      boundingBox={[
        [36.791, -123.64],
        [38.719, -121.025],
      ]}
    />
  </StrictMode>
);
