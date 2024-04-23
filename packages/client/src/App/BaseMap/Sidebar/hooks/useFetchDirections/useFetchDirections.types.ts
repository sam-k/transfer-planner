import type {LocationInfo} from '../../Sidebar.types';

/** Type for props for fetching transit directions. */
export interface UseFetchDirectionsProps {
  /** Start location information. */
  startLocation?: LocationInfo;
  /** End location information. */
  endLocation?: LocationInfo;
  /** Scheduling information. */
  schedule?: {
    /** Date and time of this schedule. */
    dateTime?: Date;
    /** Whether this date and time are that which to arrive by. */
    isArriveBy?: boolean;
  };
}
