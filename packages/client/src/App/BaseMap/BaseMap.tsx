import {Map as LeafletMap} from 'leaflet';
import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  type TileLayerProps,
} from 'react-leaflet';

import {API_SERVER_URL, ENV_VARS} from '../../constants';
import {areCoordsInBounds} from '../../utils';
import {BaseMapContextProvider} from '../BaseMapContext';
import './BaseMap.css';
import type {BaseMapProps} from './BaseMap.types';
import Marker, {type MarkerProps} from './Marker';
import Sidebar from './Sidebar';

/** Renders the base map for the application. */
const BaseMap = (props: BaseMapProps) => {
  const {tileApi, searchApi, defaultCenter, boundingBox} = props;

  const [marker, setMarker] = useState<MarkerProps>();
  const [startMarker, setStartMarker] = useState<MarkerProps>();
  const [endMarker, setEndMarker] = useState<MarkerProps>();

  const mapRef = useRef<LeafletMap>();

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

  // Whether we should try to center the map at the current location.
  const shouldCenterAtCurrentPos = useRef(true);
  useEffect(() => {
    if (!mapRef.current || !currentPos || !shouldCenterAtCurrentPos.current) {
      // Update map center only upon first fetch.
      return;
    }

    if (
      boundingBox &&
      !areCoordsInBounds(
        [currentPos.coords.latitude, currentPos.coords.longitude],
        boundingBox
      )
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
    <BaseMapContextProvider
      tileApi={tileApi}
      searchApi={searchApi}
      currentPos={currentPos}
      boundingBox={boundingBox}
      mapRef={mapRef}
      setMarker={setMarker}
      setStartMarker={setStartMarker}
      setEndMarker={setEndMarker}
    >
      <Sidebar />
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

        {currentPos && (
          <Marker
            latitude={currentPos.coords.latitude}
            longitude={currentPos.coords.longitude}
            accuracyRadiusM={currentPos.coords.accuracy}
            classNames={{
              accuracy: 'currentPos-accuracy',
              icon: 'currentPos-icon',
            }}
          />
        )}
        {startMarker || endMarker ? (
          <>
            {startMarker && <Marker {...startMarker} />}
            {endMarker && (
              <Marker classNames={{icon: 'endMarker-icon'}} {...endMarker} />
            )}
          </>
        ) : (
          marker && <Marker {...marker} />
        )}

        <ZoomControl position="bottomright" />
      </MapContainer>
    </BaseMapContextProvider>
  );
};

export default memo(BaseMap);
