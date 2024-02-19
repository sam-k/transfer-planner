import {DivIcon} from 'leaflet';
import React from 'react';
import {Circle, Marker} from 'react-leaflet';

import {useAppContext} from '../../../AppContext';
import './CurrentPosMarker.css';

/** Renders a map marker showing the user device's current location. */
const CurrentPosMarker = () => {
  const {currentPos} = useAppContext();

  if (!currentPos) {
    return null;
  }
  return (
    <>
      <Circle
        className="currentPos-accuracy"
        center={[currentPos.coords.latitude, currentPos.coords.longitude]}
        radius={currentPos.coords.accuracy} // In m
        interactive={false}
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
        interactive={false}
        keyboard={false}
      />
    </>
  );
};

export default CurrentPosMarker;
