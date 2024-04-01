import type {LocationInfo} from '../../Sidebar.types';

/** Type for props for fetching transit directions. */
export interface UseFetchDirectionsProps {
  /** Start location information. */
  fromLocation?: LocationInfo;
  /** End location information. */
  toLocation?: LocationInfo;
}
