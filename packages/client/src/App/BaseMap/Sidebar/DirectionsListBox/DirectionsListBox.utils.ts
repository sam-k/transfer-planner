import {Mode as TransitMode} from '@internal/otp';
import {
  DirectionsBike as DirectionsBikeIcon,
  DirectionsBoat as DirectionsBoatIcon,
  DirectionsBus as DirectionsBusIcon,
  DirectionsCar as DirectionsCarIcon,
  DirectionsRailway as DirectionsRailwayIcon,
  DirectionsSubway as DirectionsSubwayIcon,
  DirectionsTransit as DirectionsTransitIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Flight as FlightIcon,
  LocalTaxi as LocalTaxiIcon,
  Moped as MopedIcon,
  Tram as TramIcon,
  type SvgIconComponent,
} from '@mui/icons-material';
import {formatDuration, intervalToDuration, type Locale} from 'date-fns';

/**
 * Distance to be considered a very short trip and thus should be excluded from
 * the itinerary view, in meters.
 */
export const VERY_SHORT_DIST_M = 500;

/** Time short format. */
export const TIME_FORMAT = 'h:mm a';

/**
 * Type for time-unit tokens used by `formatDistance` in `date-fns`. The library
 * does not export this type, so we recreate it here.
 *
 * Abridged from
 * https://github.com/date-fns/date-fns/blob/b3ddacb57c26b29e884456f27b08533dbdf8ea3c/src/locale/types.ts#L32.
 */
type FormatDistanceToken =
  | 'xYears'
  | 'xMonths'
  | 'xWeeks'
  | 'xDays'
  | 'xHours'
  | 'xMinutes'
  | 'xSeconds';

/** Token with which to replace the count of time units. */
const COUNT_TOKEN = '{count}';

/** Suffixes with which to replace time units in a duration. */
const tokensToShortUnits: Partial<Record<FormatDistanceToken, string>> = [
  ['xYears', 'yr'],
  ['xMonths', 'mon'],
  ['xWeeks', 'wk'],
  ['xDays', 'd'],
  ['xHours', 'hr'],
  ['xMinutes', 'min'],
  ['xSeconds', 's'],
].reduce(
  (acc, [token, unit]) => ({
    ...acc,
    [token]: `${COUNT_TOKEN} ${unit}`,
  }),
  /* initialValue= */ {}
);

/** Makeshift `date-fns` locale for formatting durations. */
const SHORT_DURATION_LOCALE: Locale = {
  formatDistance: (token: FormatDistanceToken, count: number) =>
    tokensToShortUnits[token]?.replace(COUNT_TOKEN, `${count}`),
} as const;

/** Converts a duration into a short readable format. */
export const formatShortDuration = (seconds: number) =>
  formatDuration(
    intervalToDuration({
      start: 0,
      // Round to the nearest minute; in milliseconds.
      end: Math.round(seconds / 60) * 60 * 1000,
    }),
    {locale: SHORT_DURATION_LOCALE}
  );

/** Gets the appropriate icon for a mode of transit. */
export const getOtpModeIcon = (transitMode?: TransitMode): SvgIconComponent => {
  switch (transitMode) {
    case TransitMode.Airplane:
      return FlightIcon;

    case TransitMode.Bicycle:
      return DirectionsBikeIcon;

    case TransitMode.Bus:
    case TransitMode.Coach:
    case TransitMode.Trolleybus:
      return DirectionsBusIcon;

    case TransitMode.Car:
    case TransitMode.Carpool:
      return DirectionsCarIcon;

    case TransitMode.Ferry:
      return DirectionsBoatIcon;

    case TransitMode.Rail:
    case TransitMode.Monorail:
      return DirectionsRailwayIcon;

    case TransitMode.Scooter:
      return MopedIcon;

    case TransitMode.Subway:
      return DirectionsSubwayIcon;

    case TransitMode.Taxi:
      return LocalTaxiIcon;

    case TransitMode.Tram:
    case TransitMode.CableCar:
    case TransitMode.Funicular:
    case TransitMode.Gondola:
      return TramIcon;

    case TransitMode.Walk:
      return DirectionsWalkIcon;

    default:
      return DirectionsTransitIcon;
  }
};
