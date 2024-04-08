import type {Itinerary, Leg} from '@internal/otp';

import type {LatLngCoords} from '../../../../types';

/** Type for props for rendering a box listing directions. */
export interface DirectionsListBoxProps {
  /** Coordinates of the start location. */
  startCoords?: LatLngCoords;
  /** Coordinates of the end location. */
  endCoords?: LatLngCoords;
  /** List of itineraries for these directions. */
  itineraries?: Itinerary[];
  /** Whether the directions are loading. */
  isLoading?: boolean;
}

/** Type for props for rendering information about an itinerary. */
export interface DirectionItineraryProps extends Itinerary {
  /** Classes to apply to the itinerary. */
  classNames?: {
    /** Class to apply to the itinerary container. */
    container?: string;
  };
  /** Timezone of the start location. */
  startTimezone?: string;
  /** Timezone of the end location. */
  endTimezone?: string;
}

/** Type for props for rendering information about a leg in an itinerary. */
export type DirectionLegProps = Leg;
