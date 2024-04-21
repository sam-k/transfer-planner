import Color from 'color';
import {DivIcon} from 'leaflet';
import React, {memo, useMemo} from 'react';
import {
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
  type PolylineProps as LeafletPolylineProps,
} from 'react-leaflet';

import type {LatLngCoords} from '../../../types';
import './Polyline.css';
import type {PolylineProps} from './Polyline.types';

/** Default color for the polyline. */
const DEFAULT_COLOR = '#9c9c9c';

/** Renders a marker for a polyline's endpoint. */
const EndpointMarker = memo(({coords}: {coords: LatLngCoords}) => (
  <LeafletMarker
    position={coords}
    icon={
      new DivIcon({
        className: 'polyline-stopMarker-icon',
        iconSize: [6, 6], // In pixels
        // Center offset of 6px x 6px circle with 2px borders.
        iconAnchor: [5, 5], // In pixels
      })
    }
    keyboard={false}
  />
));

/** Renders a polyline on the map. */
const Polyline = (props: PolylineProps) => {
  const {coordsList, color, isTransit} = props;

  const lineColor = useMemo(() => color || DEFAULT_COLOR, [color]);
  const outlineColor = useMemo(
    () =>
      Color(color || DEFAULT_COLOR)
        .darken(0.5)
        .hex(),
    [color]
  );

  const additionalPolylineProps = useMemo<
    Partial<LeafletPolylineProps> | undefined
  >(() => (isTransit ? undefined : {dashArray: '1 10'}), [isTransit]);

  return (
    <>
      {isTransit && (
        <>
          <EndpointMarker coords={coordsList[0]} />
          <EndpointMarker coords={coordsList[coordsList.length - 1]} />
        </>
      )}
      <LeafletPolyline
        positions={coordsList}
        color={outlineColor}
        weight={8}
        smoothFactor={1}
        {...additionalPolylineProps}
      />
      <LeafletPolyline
        positions={coordsList}
        color={lineColor}
        weight={5}
        smoothFactor={1}
        {...additionalPolylineProps}
      />
    </>
  );
};

export default memo(Polyline);
