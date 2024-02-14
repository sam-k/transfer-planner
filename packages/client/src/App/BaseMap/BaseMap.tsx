import type {Map} from 'leaflet';
import React, {useEffect, useMemo, useRef} from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  type TileLayerProps,
} from 'react-leaflet';

import {useAppContext} from '../../AppContext';
import {API_SERVER_URL, ENV_VARS} from '../../constants';
import './BaseMap.css';
import type {BaseMapProps} from './BaseMap.types';

/** Renders the base map for the application. */
const BaseMap = (props: BaseMapProps) => {
  const {tileApi} = props;

  const {currentPos, defaultCenter, boundingBox} = useAppContext();

  const mapRef = useRef<Map>(null);

  // Whether the map is centered at the current location.
  const isCenteredAtCurrentPos = useRef(false);
  useEffect(() => {
    if (!mapRef.current || !currentPos || isCenteredAtCurrentPos.current) {
      // Update map center only upon first fetch.
      return;
    }
    mapRef.current.setView([
      currentPos.coords.latitude,
      currentPos.coords.longitude,
    ]);
    isCenteredAtCurrentPos.current = true;
  }, [currentPos]);

  const tileLayerProps = useMemo<TileLayerProps>(() => {
    switch (tileApi) {
      case 'mapbox':
        // TODO: Add Mapbox logo attribution.
        return {
          url:
            `${API_SERVER_URL}/fetch?` +
            [
              `encodedUrl=${encodeURIComponent(
                'https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?' +
                  `access_token=${ENV_VARS.mapboxApiKey}`
              )}`,
              'z={z}',
              'x={x}',
              'y={y}',
            ].join('&'),
          attribution: [
            '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            '<strong><a href="https://www.mapbox.com/map-feedback/">Improve this map</a></strong>',
          ].join(' '),
        };
      case 'osm':
      default:
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  }, [tileApi]);

  return (
    <MapContainer
      className="map"
      center={defaultCenter}
      maxBounds={boundingBox}
      maxBoundsViscosity={1}
      // TODO: Set zoom based on max bounds.
      zoom={16}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer bounds={boundingBox} {...tileLayerProps} />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default BaseMap;
