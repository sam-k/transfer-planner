import {decode as decodePolyline} from '@googlemaps/polyline-codec';
import {Typography} from '@mui/material';
import React, {memo, useCallback, useMemo} from 'react';

import {capColorSaturation, filterAndJoin} from '../../../../utils';
import {useBaseMapContext} from '../../../BaseMapContext';
import type {PolylineProps} from '../../Polyline';
import LoadingBar from '../LoadingBar';
import {
  ItinerarySummary,
  formatShortDuration,
  formatTimestamp,
} from '../Sidebar.utils';
import './DirectionsListBox.css';
import type {
  DirectionItineraryProps,
  DirectionsListBoxProps,
} from './DirectionsListBox.types';

/** Renders simplified information about a single itinerary. */
const DirectionItinerary = memo((props: DirectionItineraryProps) => {
  const {itinerary, classNames, startTimezone, endTimezone, onSelect} = props;

  const {
    startTime: startTimestamp,
    endTime: endTimestamp,
    duration,
  } = itinerary;

  const startTimeStr = useMemo(
    () => formatTimestamp(startTimestamp, startTimezone),
    [startTimestamp, startTimezone]
  );
  const endTimeStr = useMemo(
    () => formatTimestamp(endTimestamp, endTimezone),
    [endTimestamp, endTimezone]
  );
  const durationStr = useMemo(
    () => (duration != null ? formatShortDuration(duration) : ''),
    [duration]
  );

  return (
    <div
      className={filterAndJoin(
        ['directionsListBox-itin', classNames?.container],
        /* sep= */ ' '
      )}
      onClick={() => {
        onSelect?.(itinerary);
      }}
    >
      <div className="directionsListBox-itin-timesRow">
        <Typography className="directionsListBox-itin-timesRow-text">
          {startTimeStr} – {endTimeStr}
        </Typography>
        <Typography className="directionsListBox-itin-timesRow-text">
          {durationStr}
        </Typography>
      </div>
      <ItinerarySummary {...itinerary} />
    </div>
  );
});

/** Renders a box listing directions. */
const DirectionsListBox = (props: DirectionsListBoxProps) => {
  const {isLoading, itineraries, startTimezone, endTimezone, onSelect} = props;

  const {setDirectionsPolylines} = useBaseMapContext();

  /** Gets the class name for an itinerary container. */
  const getItineraryContainerClassName = useCallback(
    (index: number) => {
      if (!itineraries) {
        return undefined;
      }

      const classNamesArr: string[] = [];
      if (index > 0) {
        classNamesArr.push('directionsListBox-itin-morePrev');
      }
      if (index < itineraries.length - 1) {
        classNamesArr.push('directionsListBox-itin-moreNext');
      }
      return classNamesArr.join(' ');
    },
    [itineraries]
  );

  return (
    <div className="directionsListBox">
      {isLoading ? (
        // Container for padding purposes.
        <div>
          <LoadingBar />
        </div>
      ) : itineraries?.length ? (
        itineraries.map((itin, i) => (
          <DirectionItinerary
            key={i}
            classNames={{container: getItineraryContainerClassName(i)}}
            itinerary={itin}
            startTimezone={startTimezone}
            endTimezone={endTimezone}
            onSelect={itin => {
              for (const leg of itin.legs) {
                if (leg?.legGeometry?.points) {
                  setDirectionsPolylines?.(prevState => [
                    ...(prevState ?? []),
                    {
                      coordsList: decodePolyline(leg.legGeometry!.points!),
                      color: leg.trip?.route?.color
                        ? capColorSaturation(leg.trip.route.color)
                        : undefined,
                      isTransit: Boolean(leg.transitLeg),
                    } satisfies PolylineProps,
                  ]);
                }
              }
              onSelect?.(itin);
            }}
          />
        ))
      ) : (
        <Typography
          className="directionsListBox-noResults"
          color="text.secondary"
        >
          No directions found
        </Typography>
      )}
    </div>
  );
};

export default memo(DirectionsListBox);
