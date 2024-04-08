import type {LocationInfo} from '../../Sidebar.types';

/** Type for props for fetching transit directions. */
export interface UseFetchDirectionsProps {
  /** Start location information. */
  startLocation?: LocationInfo;
  /** End location information. */
  endLocation?: LocationInfo;
}
