import type {Itinerary, Leg} from '@internal/otp';
import {NavigateNext as NavigateNextIcon} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {format as formatTimeTz} from 'date-fns-tz';
import React, {Fragment, memo, useMemo} from 'react';

import './DirectionsListBox.css';
import type {DirectionsListBoxProps} from './DirectionsListBox.types';
import {
  TIME_FORMAT,
  formatShortDuration,
  getOtpModeIcon,
} from './DirectionsListBox.utils';

/** Renders simplified information about a single leg in an itinerary. */
const DirectionLeg = memo(({mode, duration, transitLeg, trip}: Leg) => {
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
    <div className="directionLeg">
      <TransitModeIcon
        className="directionLeg-modeIcon"
        sx={{color: 'text.secondary'}}
      />
      <Box
        className={transitLeg ? 'directionLeg-transitDescContainer' : undefined}
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
          className="directionLeg-transitDesc"
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
  ({startTime, endTime, duration, legs}: Itinerary) => {
    const startTimeStr = useMemo(
      // TODO: Determine timezone.
      () => formatTimeTz(new Date(startTime), TIME_FORMAT, {timeZone: ''}),
      [startTime]
    );

    const endTimeStr = useMemo(
      // TODO: Determine timezone.
      () => formatTimeTz(new Date(endTime), TIME_FORMAT, {timeZone: ''}),
      [endTime]
    );

    const durationStr = useMemo(
      () => formatShortDuration(duration),
      [duration]
    );

    return (
      <div>
        <div className="directionLi-timeRow">
          <Typography className="directionLi-timeRow-text">
            {startTimeStr} – {endTimeStr}
          </Typography>
          <Typography className="directionLi-timeRow-text">
            {durationStr}
          </Typography>
        </div>
        <div className="directionLi-legsRow">
          {legs.map(
            (leg, i) =>
              leg && (
                <Fragment key={i}>
                  {i > 0 && (
                    <div className="directionLeg-divider">
                      <NavigateNextIcon
                        className="directionLeg-dividerIcon"
                        sx={{color: 'text.secondary'}}
                      />
                    </div>
                  )}
                  <DirectionLeg {...leg} />
                </Fragment>
              )
          )}
        </div>
      </div>
    );
  }
);

/** Renders a box listing directions. */
const DirectionsListBox = (props: DirectionsListBoxProps) => {
  const {itineraries} = props;

  return (
    <div className="directionsListBox">
      {itineraries.length ? (
        itineraries.map((itin, i) => <DirectionItinerary key={i} {...itin} />)
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
