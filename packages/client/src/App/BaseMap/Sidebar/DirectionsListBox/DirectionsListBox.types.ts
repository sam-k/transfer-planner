import type {Itinerary} from '@internal/otp';

/** Type for props for rendering a box listing directions. */
export interface DirectionsListBoxProps {
  /** List of itineraries for these directions. */
  itineraries: Itinerary[];
}
