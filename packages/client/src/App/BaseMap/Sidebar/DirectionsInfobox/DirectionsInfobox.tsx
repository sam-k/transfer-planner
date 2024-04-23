import {Mode as TransitMode, type Leg, type Place} from '@internal/otp';
import {
  Close as CloseIcon,
  DirectionsTransit as DirectionsTransitIcon,
  DirectionsWalk as DirectionsWalkIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Route as RouteIcon,
  Schedule as ScheduleIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {Box, Button, Link, Typography, type SxProps} from '@mui/material';
import {merge} from 'lodash-es';
import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type Ref,
  type RefCallback,
} from 'react';

import {capColorSaturation, filterAndJoin} from '../../../../utils';
import {useBaseMapContext} from '../../../BaseMapContext';
import {
  ItinerarySummary,
  formatLongDuration,
  formatShortDuration,
  formatTimestamp,
  getOtpModeIcon,
} from '../Sidebar.utils';
import './DirectionsInfobox.css';
import type {DirectionsInfoboxProps} from './DirectionsInfobox.types';
import LocationIcon from './LocationIcon';
import useNegativeOffset from './useNegativeOffset';

/** Transit modes that are rail or rail-adjacent. */
const RAIL_MODES: ReadonlySet<TransitMode> = new Set([
  TransitMode.CableCar,
  TransitMode.Funicular,
  TransitMode.Gondola,
  TransitMode.Monorail,
  TransitMode.Rail,
  TransitMode.Subway,
  TransitMode.Tram,
]);

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
    timestamp,
    timezone,
    color,
    isIntermediate,
    containerRef,
  }: {
    label?: string;
    timestamp?: number;
    timezone?: string;
    color?: string;
    isIntermediate?: boolean;
    containerRef?: Ref<HTMLDivElement>;
  }) => (
    <div className="directionsInfobox-location" ref={containerRef}>
      <LocationIcon
        className="directionsInfobox-location-icon"
        strokeColor={color ? capColorSaturation(color) : 'black'}
      />
      <div className="directionsInfobox-location-details">
        <Typography
          {...(isIntermediate
            ? {variant: 'body2', color: 'text.secondary'}
            : undefined)}
        >
          {label || 'Current location'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatTimestamp(timestamp, timezone)}
        </Typography>
      </div>
    </div>
  )
);

/** Renders information about intermediate stops between two locations. */
const DirIntermediateStops = memo(
  ({
    durationStr,
    places,
    color,
    timezone,
    isTransit,
    TransitModeIcon,
    containerSx,
  }: {
    durationStr: string;
    places?: Place[];
    color?: string;
    timezone?: string;
    isTransit: boolean;
    TransitModeIcon: SvgIconComponent;
    containerSx?: SxProps;
  }) => {
    /** Whether this stops list is expandable. */
    const isExpandable = useMemo(
      () => isTransit && places?.length,
      [places, isTransit]
    );

    // Whether this stops list is currently expanded.
    const [isExpanded, setIsExpanded] = useState(false);

    const numStopsStr = useMemo(() => {
      if (!isTransit) {
        return undefined;
      }
      // Add 1 to include destination stop.
      const numStops = (places?.length ?? 0) + 1;
      return `(${numStops} ${numStops === 1 ? 'stop' : 'stops'})`;
    }, [places, isTransit]);

    // Measure the height of the stops list, in pixels.
    const [stopsListHeightPx, setStopsListHeightPx] = useState(0);
    const stopsListRef = useCallback<RefCallback<HTMLDivElement>>(el => {
      if (!el) {
        return;
      }
      setStopsListHeightPx(el.clientHeight);
    }, []);

    // Toggle visibility of the stops list in a way that enables CSS transition.
    const stopsListContainerRef = useRef<HTMLDivElement>(null);
    const toggleStopsList = useCallback(
      (shouldEnable: boolean) => {
        if (!stopsListContainerRef.current) {
          return;
        }
        stopsListContainerRef.current.style.height = shouldEnable
          ? `${stopsListHeightPx}px`
          : '0';
      },
      [stopsListHeightPx]
    );

    return (
      <Box
        className={[
          'directionsInfobox-intermediateStopsContainer',
          isTransit
            ? 'directionsInfobox-intermediateStopsContainer-transit'
            : 'directionsInfobox-intermediateStopsContainer-nonTransit',
        ].join(' ')}
        onClick={() => {
          setIsExpanded(prevState => {
            const newState = !prevState;
            toggleStopsList(newState);
            return newState;
          });
        }}
        sx={merge(
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
        <div
          className={filterAndJoin(
            [
              'directionsInfobox-intermediateStops-details',
              isExpandable
                ? 'directionsInfobox-intermediateStops-details-expandable'
                : undefined,
            ],
            /* sep= */ ' '
          )}
        >
          <TransitModeIcon
            className="directionsInfobox-intermediateStops-details-icon"
            sx={{color: 'text.secondary'}}
          />
          <Typography variant="body2" color="text.secondary">
            {filterAndJoin([durationStr, numStopsStr], /* sep= */ ' ')}
          </Typography>
          {isExpandable &&
            (isExpanded ? (
              <KeyboardArrowUpIcon
                fontSize="small"
                sx={{color: 'text.secondary'}}
              />
            ) : (
              <KeyboardArrowDownIcon
                fontSize="small"
                sx={{color: 'text.secondary'}}
              />
            ))}
        </div>
        <div
          className="directionsInfobox-intermediateStops-listContainer"
          ref={stopsListContainerRef}
        >
          <div
            className="directionsInfobox-intermediateStops-list"
            ref={stopsListRef}
          >
            {places?.map((place, i) => (
              <DirLocation
                key={i}
                label={place.stop?.name}
                timestamp={place.arrivalTime}
                timezone={timezone}
                color={color}
                isIntermediate
              />
            ))}
          </div>
        </div>
      </Box>
    );
  }
);

/** Renders information about a single leg in an itinerary. */
const DirLeg = memo(
  ({
    leg,
    itinOffsetsPx: {
      start: itinStartLocationOffsetPx,
      end: itinEndLocationOffsetPx,
    } = {},
  }: {
    leg: Leg;
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
      intermediatePlaces,
    } = leg;
    const {route, tripHeadsign, tripShortName} = trip ?? {};
    const {
      shortName: routeShortName,
      color,
      textColor,
      url: routeUrl,
      agency,
    } = route ?? {};
    const {
      name: agencyName,
      timezone: agencyTimezone,
      url: agencyUrl,
    } = agency ?? {};

    const {ref: legStartLocationRef, offsetPx: legStartLocationOffsetPx} =
      useNegativeOffset();
    const {ref: legEndLocationRef, offsetPx: legEndLocationOffsetPx} =
      useNegativeOffset();

    const TransitModeIcon = useMemo(() => getOtpModeIcon(mode), [mode]);

    if (!duration) {
      return null;
    }
    switch (mode) {
      case TransitMode.Walk:
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
                    href={routeUrl || undefined}
                    underline={routeUrl ? 'hover' : 'none'}
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
                  {routeShortName !== tripHeadsign && (
                    <Typography>
                      {filterAndJoin(
                        [
                          mode && RAIL_MODES.has(mode)
                            ? tripShortName
                            : undefined,
                          'to',
                          tripHeadsign,
                        ],
                        /* sep= */ ' '
                      )}
                    </Typography>
                  )}
                </div>
                <Typography
                  className="directionsInfobox-leg-routeHeader-route-agency"
                  variant="caption"
                >
                  <Link
                    href={agencyUrl || undefined}
                    color="text.secondary"
                    underline={agencyUrl ? 'hover' : 'none'}
                  >
                    {agencyName}
                  </Link>
                </Typography>
              </div>
            </div>
            <div>
              <DirLocation
                label={fromName ?? ''}
                timestamp={startTimestamp ?? undefined}
                timezone={agencyTimezone}
                color={color ?? ''}
                containerRef={legStartLocationRef}
              />
              <DirIntermediateStops
                durationStr={formatLongDuration(duration)}
                places={intermediatePlaces?.filter((place): place is Place =>
                  Boolean(place)
                )}
                isTransit={Boolean(transitLeg)}
                color={color ?? ''}
                timezone={agencyTimezone}
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
                timestamp={endTimestamp ?? undefined}
                timezone={agencyTimezone}
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
    startTimezone: startLocationTimezone,
    endTimezone: endLocationTimezone,
    onClose,
  } = props;

  const {setDirectionsPolylines} = useBaseMapContext();

  const {
    startTime: startLocationTimestamp,
    endTime: endLocationTimestamp,
    duration,
    walkTime,
    waitingTime,
    legs,
  } = itinerary;

  const startTimeStr = useMemo(
    () => formatTimestamp(startLocationTimestamp, startLocationTimezone),
    [startLocationTimestamp, startLocationTimezone]
  );
  const endTimeStr = useMemo(
    () => formatTimestamp(endLocationTimestamp, endLocationTimezone),
    [endLocationTimestamp, endLocationTimezone]
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
            timestamp={startLocationTimestamp ?? undefined}
            timezone={startLocationTimezone}
            containerRef={startLocationRef}
          />
          {legs
            .filter((leg): leg is Leg => Boolean(leg))
            .map((leg, i) => (
              <DirLeg
                key={i}
                leg={leg}
                itinOffsetsPx={{
                  start: i === 0 ? startLocationOffsetPx : undefined,
                  end: i === legs.length - 1 ? endLocationOffsetPx : undefined,
                }}
              />
            ))}
          <DirLocation
            label={endLocationLabel}
            timestamp={endLocationTimestamp ?? undefined}
            timezone={endLocationTimezone}
            containerRef={endLocationRef}
          />
        </div>
      </div>
      <Button
        className="directionsInfobox-closeButton"
        variant="contained"
        onClick={() => {
          setDirectionsPolylines?.([]); // Clear polylines
          onClose?.();
        }}
      >
        <CloseIcon fontSize="small" sx={{color: 'text.secondary'}} />
      </Button>
    </div>
  );
};

export default memo(DirectionsInfobox);
