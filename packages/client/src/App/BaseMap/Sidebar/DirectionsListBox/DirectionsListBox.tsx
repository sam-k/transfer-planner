import type {Itinerary, Leg} from '@internal/otp';
import {NavigateNext as NavigateNextIcon} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {format as formatTimeTz} from 'date-fns-tz';
import React, {Fragment, memo, useCallback, useMemo} from 'react';

import {filterAndJoin} from '../../../../utils';
import LoadingBar from '../LoadingBar';
import './DirectionsListBox.css';
import type {DirectionsListBoxProps} from './DirectionsListBox.types';
import {
  TIME_FORMAT,
  VERY_SHORT_DIST_M,
  formatShortDuration,
  getOtpModeIcon,
} from './DirectionsListBox.utils';

/** Renders simplified information about a single leg in an itinerary. */
const DirectionLeg = memo((props: Leg) => {
  const {mode, duration, transitLeg, trip} = props;

  /** Icon for the mode of transit for this leg. */
  const TransitModeIcon = useMemo(
    () => getOtpModeIcon(mode ?? undefined),
    [mode]
  );

  /**
   * Short description for this leg.
   *
   * Line information if this is a transit leg; duration of the leg otherwise.
   */
  const transitModeDesc = useMemo(
    () =>
      transitLeg
        ? trip?.route?.shortName ?? ''
        : formatShortDuration(duration ?? 0),
    [transitLeg, trip, duration]
  );

  return (
    <div className="leg">
      <TransitModeIcon
        className="leg-modeIcon"
        sx={{color: 'text.secondary'}}
      />
      <Box
        className={transitLeg ? 'leg-transitDescContainer' : undefined}
        sx={
          transitLeg
            ? {
                backgroundColor: trip?.route?.color
                  ? `#${trip.route.color}`
                  : undefined,
                outline: trip?.route?.color ? undefined : 'black solid 1px',
                outlineOffset: '-1px',
              }
            : undefined
        }
      >
        <Typography
          className="leg-transitDesc"
          variant="caption"
          color={
            transitLeg
              ? `#${trip?.route?.textColor ?? '000'}`
              : 'text.secondary'
          }
        >
          {transitModeDesc}
        </Typography>
      </Box>
    </div>
  );
});

/** Renders simplified information about a single itinerary. */
const DirectionItinerary = memo(
  (props: Itinerary & {classNames?: {container?: string}}) => {
    const {startTime, endTime, duration, legs, classNames} = props;

    const startTimeStr = useMemo(
      () =>
        startTime != null
          ? // TODO: Determine timezone.
            formatTimeTz(new Date(startTime), TIME_FORMAT, {timeZone: ''})
          : '',
      [startTime]
    );
    const endTimeStr = useMemo(
      () =>
        endTime != null
          ? // TODO: Determine timezone.
            formatTimeTz(new Date(endTime), TIME_FORMAT, {timeZone: ''})
          : '',
      [endTime]
    );
    const durationStr = useMemo(
      () => (duration != null ? formatShortDuration(duration) : ''),
      [duration]
    );

    /** Legs to render in the itinerary view. */
    const sanitizedLegs = useMemo(
      () =>
        legs
          // Filter out nullish legs.
          .filter((leg): leg is Leg => Boolean(leg))
          // Filter out very short non-transit legs.
          .filter(
            leg => leg.transitLeg || (leg.distance ?? 0) > VERY_SHORT_DIST_M
          ),
      [legs]
    );

    return (
      <div
        className={filterAndJoin(
          ['itinerary', classNames?.container],
          /* sep= */ ' '
        )}
      >
        <div className="itinerary-timesRow">
          <Typography className="itinerary-timesRow-text">
            {startTimeStr} – {endTimeStr}
          </Typography>
          <Typography className="itinerary-timesRow-text">
            {durationStr}
          </Typography>
        </div>
        <div className="itinerary-legsRow">
          {sanitizedLegs.map((leg, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div className="leg-divider">
                  <NavigateNextIcon
                    className="leg-dividerIcon"
                    sx={{color: 'text.secondary'}}
                  />
                </div>
              )}
              <DirectionLeg {...leg} />
            </Fragment>
          ))}
        </div>
      </div>
    );
  }
);

/** Renders a box listing directions. */
const DirectionsListBox = (props: DirectionsListBoxProps) => {
  const {itineraries, isLoading} = props;

  /** Gets the class name for an itinerary container. */
  const getItineraryContainerClassName = useCallback(
    (index: number) => {
      if (!itineraries) {
        return undefined;
      }

      const classNamesArr: string[] = [];
      if (index > 0) {
        classNamesArr.push('itinerary-morePrev');
      }
      if (index < itineraries.length - 1) {
        classNamesArr.push('itinerary-moreNext');
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
      ) : !itineraries?.length ? (
        <Typography
          className="directionsListBox-noResults"
          color="text.secondary"
        >
          No directions found
        </Typography>
      ) : (
        itineraries.map((itin, i) => (
          <DirectionItinerary
            key={i}
            classNames={{container: getItineraryContainerClassName(i)}}
            {...itin}
          />
        ))
      )}
    </div>
  );
};

export default memo(DirectionsListBox);
