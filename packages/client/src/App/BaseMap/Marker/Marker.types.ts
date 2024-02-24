/** Type for props for rendering a map marker. */
export interface MarkerProps {
  /** Text label for the marker. */
  label?: string;
  /** Latitude of the marker. */
  latitude?: number;
  /** Longitude of the marker. */
  longitude?: number;
  /** Radius to denote the marker position's accuracy, in meters. */
  accuracyRadiusM?: number;
  /** Classes to apply to the marker. */
  classNames?: {
    /** Class to apply to the accuracy indicator. */
    accuracy?: string;
    /** Class to apply to the marker icon. */
    icon?: string;
  };
}
