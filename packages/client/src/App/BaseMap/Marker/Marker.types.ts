/** */
export interface MarkerProps {
  /** */
  label?: string;
  /** */
  latitude?: number;
  /** */
  longitude?: number;
  /** */
  accuracyRadiusM?: number;
  /** */
  classNames?: {
    /** */
    accuracy?: string;
    /** */
    icon?: string;
  };
}
