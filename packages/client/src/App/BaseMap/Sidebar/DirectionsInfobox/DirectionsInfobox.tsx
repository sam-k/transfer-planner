import {Mode, type Leg, type Stop} from '@internal/otp';
import {
  Close as CloseIcon,
  DirectionsTransit as DirectionsTransitIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Route as RouteIcon,
  Schedule as ScheduleIcon,
  TripOrigin as TripOriginIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {Box, Button, Link, Typography, type SxProps} from '@mui/material';
import {merge} from 'lodash-es';
import React, {memo, useMemo, type Ref} from 'react';

import {capColorSaturation, filterAndJoin} from '../../../../utils';
import {
  ItinerarySummary,
  formatLongDuration,
  formatShortDuration,
  formatTimestamp,
  getOtpModeIcon,
} from '../Sidebar.utils';
import './DirectionsInfobox.css';
import type {DirectionsInfoboxProps} from './DirectionsInfobox.types';
import useNegativeOffset from './useNegativeOffset';

/** Renders details about a time segment. */
const TimeDetails = memo(
  ({
    Icon,
    label,
    details,
  }: {
    Icon: SvgIconComponent;
    label?: string;
    details: string;
  }) => (
    <div className="directionsInfobox-timeDetails">
      <Icon
        className="directionsInfobox-timeDetails-icon"
        sx={label ? undefined : {color: 'text.secondary'}}
      />
      {label && (
        <Typography className="directionsInfobox-timeDetails-label">
          {label}
        </Typography>
      )}
      <Typography sx={label ? undefined : {color: 'text.secondary'}}>
        {details}
      </Typography>
    </div>
  )
);

/** Renders a separator between time details. */
const TimeDetailsSeparator = memo(() => (
  <Typography sx={{color: 'text.secondary'}}>•</Typography>
));

/** Renders a location in an itinerary. */
const DirLocation = memo(
  ({
    label,
    timeStr,
    color,
    containerRef,
  }: {
    label?: string;
    timeStr?: string;
    color?: string;
    containerRef?: Ref<HTMLDivElement>;
  }) => (
    <div className="directionsInfobox-location" ref={containerRef}>
      <TripOriginIcon
        className="directionsInfobox-location-icon"
        sx={{color: color ? capColorSaturation(color) : 'black'}}
      />
      <div className="directionsInfobox-location-details">
        <Typography>{label || 'Current location'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {timeStr}
        </Typography>
      </div>
    </div>
  )
);

/** Renders information about intermediate stops between two locations. */
const DirIntermediateStops = memo(
  ({
    durationStr,
    stops,
    color,
    isTransit,
    TransitModeIcon,
    containerSx,
  }: {
    durationStr: string;
    stops?: Stop[];
    color?: string;
    isTransit: boolean;
    TransitModeIcon: SvgIconComponent;
    containerSx?: SxProps;
  }) => {
    const numStopsStr = useMemo(() => {
      const numStops = stops?.length;
      if (!numStops) {
        return undefined;
      }
      // Add 1 to include destination stop.
      return `(${numStops + 1} ${numStops === 1 ? 'stop' : 'stops'})`;
    }, [stops]);

    return (
      <Box
        className={[
          'directionsInfobox-intermediateStops',
          isTransit
            ? 'directionsInfobox-intermediateStopsTransit'
            : 'directionsInfobox-intermediateStopsNonTransit',
        ].join(' ')}
        sx={merge(
          {},
          {
            borderColor: isTransit
              ? color
                ? capColorSaturation(color)
                : 'black'
              : 'text.secondary',
          },
          containerSx
        )}
      >
        <TransitModeIcon
          className="directionsInfobox-intermediateStops-icon"
          sx={{color: 'text.secondary'}}
        />
        <Typography variant="body2" color="text.secondary">
          {filterAndJoin([durationStr, numStopsStr], /* sep= */ ' ')}
        </Typography>
      </Box>
    );
  }
);

/** Renders information about a single leg in an itinerary. */
const DirLeg = memo(
  ({
    leg,
    timezones: {start: startTimezone, end: endTimezone} = {},
    itinOffsetsPx: {
      start: itinStartLocationOffsetPx,
      end: itinEndLocationOffsetPx,
    } = {},
  }: {
    leg: Leg;
    timezones?: {
      start?: string;
      end?: string;
    };
    itinOffsetsPx?: {
      start?: number;
      end?: number;
    };
  }) => {
    const {
      duration,
      mode,
      transitLeg,
      from: {name: fromName},
      to: {name: toName},
      startTime: startTimestamp,
      endTime: endTimestamp,
      trip,
      intermediateStops,
    } = leg;
    const {route, tripHeadsign} = trip ?? {};
    const {
      shortName: routeShortName,
      color,
      textColor,
      url: routeUrl,
      agency,
    } = route ?? {};
    const {name: agencyName, url: agencyUrl} = agency ?? {};

    const {ref: legStartLocationRef, offsetPx: legStartLocationOffsetPx} =
      useNegativeOffset();
    const {ref: legEndLocationRef, offsetPx: legEndLocationOffsetPx} =
      useNegativeOffset();

    const startTimeStr = useMemo(
      () => formatTimestamp(startTimestamp, startTimezone),
      [startTimestamp, startTimezone]
    );
    const endTimeStr = useMemo(
      () => formatTimestamp(endTimestamp, endTimezone),
      [endTimestamp, endTimezone]
    );

    const TransitModeIcon = useMemo(() => getOtpModeIcon(mode), [mode]);

    if (!duration) {
      return null;
    }
    switch (mode) {
      case Mode.Walk:
        return (
          <DirIntermediateStops
            durationStr={formatLongDuration(duration)}
            isTransit={Boolean(transitLeg)}
            color={color ?? ''}
            TransitModeIcon={TransitModeIcon}
            containerSx={{
              marginTop: `-${itinStartLocationOffsetPx || 2.5}px`,
              marginBottom: `-${itinEndLocationOffsetPx || 2.5}px`,
              paddingTop: `calc(1rem + ${itinStartLocationOffsetPx || 2.5}px)`,
              paddingBottom: `calc(1rem + ${itinEndLocationOffsetPx || 2.5}px)`,
            }}
          />
        );
      default:
        return (
          <Box className="directionsInfobox-leg">
            <div className="directionsInfobox-leg-routeHeader">
              <TransitModeIcon className="directionsInfobox-leg-routeHeader-icon" />
              <div className="directionsInfobox-leg-routeHeader-route">
                <div className="directionsInfobox-leg-routeHeader-route-titleContainer">
                  <Link
                    className="directionsInfobox-leg-routeHeader-route-title-nameContainer"
                    href={routeUrl ?? undefined}
                    underline="hover"
                    color={textColor ? capColorSaturation(textColor) : 'black'}
                    sx={{
                      backgroundColor: color
                        ? capColorSaturation(color)
                        : undefined,
                      outline: color ? undefined : 'black solid 1px',
                    }}
                  >
                    <Typography
                      className="directionsInfobox-leg-routeHeader-route-title-name"
                      color={
                        textColor ? capColorSaturation(textColor) : 'black'
                      }
                    >
                      {routeShortName}
                    </Typography>
                  </Link>
                  <Typography>to {tripHeadsign}</Typography>
                </div>
                <Link
                  className="directionsInfobox-leg-routeHeader-route-agency"
                  href={agencyUrl}
                  variant="caption"
                  color="text.secondary"
                  underline="hover"
                >
                  {agencyName}
                </Link>
              </div>
            </div>
            <div>
              <DirLocation
                label={fromName ?? ''}
                timeStr={startTimeStr}
                color={color ?? ''}
                containerRef={legStartLocationRef}
              />
              <DirIntermediateStops
                durationStr={formatLongDuration(duration)}
                stops={intermediateStops?.filter((stop): stop is Stop =>
                  Boolean(stop)
                )}
                isTransit={Boolean(transitLeg)}
                color={color ?? ''}
                TransitModeIcon={TransitModeIcon}
                containerSx={{
                  marginTop: `-${legStartLocationOffsetPx}px`,
                  marginBottom: `-${legEndLocationOffsetPx}px`,
                  paddingTop: `calc(1rem + ${legStartLocationOffsetPx}px)`,
                  paddingBottom: `calc(1rem + ${legEndLocationOffsetPx}px)`,
                }}
              />
              <DirLocation
                label={toName ?? ''}
                timeStr={endTimeStr}
                color={color ?? ''}
                containerRef={legEndLocationRef}
              />
            </div>
          </Box>
        );
    }
  }
);

/** Renders a box showing detailed directions information. */
const DirectionsInfobox = (props: DirectionsInfoboxProps) => {
  const {
    itinerary,
    startLocationLabel,
    endLocationLabel,
    startTimezone,
    endTimezone,
    onClose,
  } = props;

  const {
    startTime: startTimestamp,
    endTime: endTimestamp,
    duration,
    walkTime,
    waitingTime,
    legs,
  } = itinerary;

  const startTimeStr = useMemo(
    () => formatTimestamp(startTimestamp, startTimezone),
    [startTimestamp, startTimezone]
  );
  const endTimeStr = useMemo(
    () => formatTimestamp(endTimestamp, endTimezone),
    [endTimestamp, endTimezone]
  );
  const totalDurationStr = useMemo(
    () => formatLongDuration(duration ?? 0),
    [duration]
  );
  const walkDurationStr = useMemo(
    () => formatShortDuration(walkTime),
    [walkTime]
  );
  const waitDurationStr = useMemo(
    () => formatShortDuration(waitingTime),
    [waitingTime]
  );
  const transitDurationStr = useMemo(
    () =>
      formatShortDuration(
        (duration ?? 0) - (walkTime ?? 0) - (waitingTime ?? 0)
      ),
    [duration, walkTime, waitingTime]
  );

  const {ref: startLocationRef, offsetPx: startLocationOffsetPx} =
    useNegativeOffset();
  const {ref: endLocationRef, offsetPx: endLocationOffsetPx} =
    useNegativeOffset();

  return (
    <div className="directionsInfobox-container">
      <div className="directionsInfobox">
        <div className="directionsInfobox-header directionsInfoBox-moreNext">
          <Typography className="directionsInfobox-header-startTime">
            Go at {startTimeStr}
          </Typography>
          <ItinerarySummary {...itinerary} />
          <Typography>Arrive at {endTimeStr}</Typography>
        </div>
        <div className="directionsInfoBox-morePrev directionsInfoBox-moreNext">
          <TimeDetails
            Icon={RouteIcon}
            label="Total time: "
            details={totalDurationStr}
          />
          {(walkDurationStr || waitDurationStr || transitDurationStr) && (
            <div className="directionsInfobox-timeSummary-breakdown">
              {walkDurationStr && (
                <TimeDetails
                  Icon={DirectionsWalkIcon}
                  details={walkDurationStr}
                />
              )}
              {waitDurationStr && (
                <>
                  {walkDurationStr && <TimeDetailsSeparator />}
                  <TimeDetails Icon={ScheduleIcon} details={waitDurationStr} />
                </>
              )}
              {transitDurationStr && (
                <>
                  {(walkDurationStr || waitDurationStr) && (
                    <TimeDetailsSeparator />
                  )}
                  <TimeDetails
                    Icon={DirectionsTransitIcon}
                    details={transitDurationStr}
                  />
                </>
              )}
            </div>
          )}
        </div>
        <div className="directionsInfobox-dir directionsInfoBox-morePrev">
          <DirLocation
            label={startLocationLabel}
            timeStr={startTimeStr}
            containerRef={startLocationRef}
          />
          {legs
            .filter((leg): leg is Leg => Boolean(leg))
            .map((leg, i) => (
              <DirLeg
                key={i}
                leg={leg}
                timezones={{start: startTimezone, end: endTimezone}}
                itinOffsetsPx={{
                  start: i === 0 ? startLocationOffsetPx : undefined,
                  end: i === legs.length - 1 ? endLocationOffsetPx : undefined,
                }}
              />
            ))}
          <DirLocation
            label={endLocationLabel}
            timeStr={endTimeStr}
            containerRef={endLocationRef}
          />
        </div>
      </div>
      <Button
        className="directionsInfobox-closeButton"
        variant="contained"
        onClick={() => {
          onClose?.();
        }}
      >
        <CloseIcon fontSize="small" sx={{color: 'text.secondary'}} />
      </Button>
    </div>
  );
};

export default memo(DirectionsInfobox);
