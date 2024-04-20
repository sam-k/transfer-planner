import type {Itinerary} from '@internal/otp';

/**
 * Type for props for rendering a box showing detailed directions information.
 */
export interface DirectionsInfoboxProps {
  /** The current itinerary to render. */
  itinerary: Itinerary;
  /** Label for the start location. */
  startLocationLabel?: string;
  /** Label for the end location. */
  endLocationLabel?: string;
  /** Timezone of the start location. */
  startTimezone?: string;
  /** Timezone of the end location. */
  endTimezone?: string;
  /** Handles closing the directions infobox. */
  onClose?: () => void;
}
