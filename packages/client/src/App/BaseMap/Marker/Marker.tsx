import {Typography} from '@mui/material';
import {DivIcon} from 'leaflet';
import React, {memo} from 'react';
import {Circle, Marker as LeafletMarker, Tooltip} from 'react-leaflet';

import {filterAndJoin} from '../../../utils';
import './Marker.css';
import type {MarkerProps} from './Marker.types';

/** Renders a map marker. */
const Marker = (props: MarkerProps) => {
  const {label, latitude, longitude, accuracyRadiusM, classNames} = props;

  return (
    <>
      {accuracyRadiusM && (
        <Circle
          className={filterAndJoin(
            ['marker-accuracyRadius', classNames?.accuracy],
            /* sep= */ ' '
          )}
          center={[latitude, longitude]}
          radius={accuracyRadiusM} // In m
          interactive={false}
        />
      )}
      <LeafletMarker
        position={[latitude, longitude]}
        icon={
          new DivIcon({
            className: filterAndJoin(
              ['marker-icon', classNames?.icon],
              /* sep= */ ' '
            ),
            iconSize: [15, 15], // In px
            // Center offset of 15px x 15px circle with 3.75px borders.
            iconAnchor: [11.25, 11.25], // In px
          })
        }
        interactive={false}
        keyboard={false}
      >
        {label && (
          <Tooltip
            className="marker-label"
            position={[latitude, longitude]}
            direction="bottom"
            opacity={1}
            offset={[0, 4]}
            permanent
          >
            <Typography className="marker-label-text">{label}</Typography>
          </Tooltip>
        )}
      </LeafletMarker>
    </>
  );
};

export default memo(Marker);
