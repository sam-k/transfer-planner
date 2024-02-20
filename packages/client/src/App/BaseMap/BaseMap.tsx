import {Map as LeafletMap} from 'leaflet';
import {inRange} from 'lodash-es';
import React, {memo, useEffect, useMemo, useRef} from 'react';
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
import CurrentPosMarker from './CurrentPosMarker';

/** Renders the base map for the application. */
const BaseMap = (props: BaseMapProps) => {
  const {tileApi, defaultCenter} = props;

  const {currentPos, boundingBox} = useAppContext();

  const mapRef = useRef<LeafletMap>();

  // Whether we should try to center the map at the current location.
  const shouldCenterAtCurrentPos = useRef(true);
  useEffect(() => {
    if (!mapRef.current || !currentPos || !shouldCenterAtCurrentPos.current) {
      // Update map center only upon first fetch.
      return;
    }

    if (
      boundingBox &&
      (!inRange(
        currentPos.coords.latitude,
        boundingBox[0][0],
        boundingBox[1][0]
      ) ||
        !inRange(
          currentPos.coords.longitude,
          boundingBox[0][1],
          boundingBox[1][1]
        ))
    ) {
      // Current position lies outside the bounding box.
      return;
    }

    mapRef.current.flyTo([
      currentPos.coords.latitude,
      currentPos.coords.longitude,
    ]);
    // TODO: Set map zoom based on current position accuracy.
    shouldCenterAtCurrentPos.current = false;
  }, [currentPos, boundingBox]);

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
      zoom={16}
      zoomControl={false}
      ref={(el: LeafletMap) => {
        if (el instanceof LeafletMap && boundingBox) {
          el.setMinZoom(el.getBoundsZoom(boundingBox, /* inside= */ true));
        }
        mapRef.current = el;
      }}
      keyboard={false}
    >
      <TileLayer bounds={boundingBox} {...tileLayerProps} />
      <CurrentPosMarker />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default memo(BaseMap);
