import React, {useMemo} from 'react';
import {MapContainer, TileLayer, type TileLayerProps} from 'react-leaflet';

import './BaseMap.css';
import type {BaseMapProps} from './BaseMap.types';

const BaseMap = (props: BaseMapProps) => {
  const {tileServer, boundingBox} = props;

  const tileLayerProps = useMemo<TileLayerProps>(() => {
    switch (tileServer) {
      case 'mapbox':
        // TODO: Add Mapbox logo attribution.
        return {
          url:
            'http://localhost:3000/fetch-with-key' +
            `?encodedUrl=${encodeURIComponent(
              'https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${KEY}'
            )}` +
            '&encodedKeyId=MAPBOX_API_KEY' +
            '&z={z}' +
            '&x={x}' +
            '&y={y}',
          attribution: [
            '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            '<strong><a href="https://www.mapbox.com/map-feedback/">Improve this map</a></strong>',
          ].join(' '),
        };
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  }, [tileServer]);

  return (
    <MapContainer
      className="map"
      // TODO: Fetch current location instead of hardcoding.
      center={[37.77919, -122.41914]}
      maxBounds={boundingBox}
      maxBoundsViscosity={1}
      // TODO: Set zoom based on max bounds.
      zoom={16}
    >
      <TileLayer bounds={boundingBox} {...tileLayerProps} />
    </MapContainer>
  );
};

export default BaseMap;
