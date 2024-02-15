import {DivIcon, type Map as LeafletMap} from 'leaflet';
import {inRange} from 'lodash-es';
import React, {useEffect, useMemo, useRef} from 'react';
import {
  Circle,
  MapContainer,
  Marker,
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

  const mapRef = useRef<LeafletMap>(null);

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

    mapRef.current.setView([
      currentPos.coords.latitude,
      currentPos.coords.longitude,
    ]);
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
      // TODO: Set zoom based on max bounds.
      zoom={16}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer bounds={boundingBox} {...tileLayerProps} />
      {currentPos && (
        <>
          <Circle
            className="currentPos-accuracy"
            center={[currentPos.coords.latitude, currentPos.coords.longitude]}
            radius={currentPos.coords.accuracy} // Radius in m
          />
          <Marker
            position={[currentPos.coords.latitude, currentPos.coords.longitude]}
            icon={
              new DivIcon({
                className: 'currentPos-marker',
                iconSize: [15, 15], // In px
                // Center offset of 15px x 15px circle with 3.75px borders.
                iconAnchor: [11.25, 11.25], // In px
              })
            }
          />
        </>
      )}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default BaseMap;
