import type {Itinerary, Leg} from '@internal/otp';

import type {LatLngCoords} from '../../../../types';

/** Type for props for rendering a box listing directions. */
export interface DirectionsListBoxProps {
  endCoords?: LatLngCoords;
  /** Whether the directions are loading. */
  isLoading?: boolean;
  /** List of itineraries for these directions. */
  itineraries?: Itinerary[];
  /** Timezone of the start location. */
  startTimezone?: string;
  /** Timezone of the end location. */
  endTimezone?: string;
  /** Handles selecting an itinerary. */
  onSelect?: (itin: Itinerary) => void;
}

/** Type for props for rendering information about an itinerary. */
export interface DirectionItineraryProps {
  /** This itinerary. */
  itinerary: Itinerary;
  /** Classes to apply to the itinerary. */
  classNames?: {
    /** Class to apply to the itinerary container. */
    container?: string;
  };
  /** Timezone of the start location. */
  startTimezone?: string;
  /** Timezone of the end location. */
  endTimezone?: string;
  /** Handles selecting this itinerary. */
  onSelect?: (itin: Itinerary) => void;
}

/** Type for props for rendering information about a leg in an itinerary. */
export type DirectionLegProps = Leg;
