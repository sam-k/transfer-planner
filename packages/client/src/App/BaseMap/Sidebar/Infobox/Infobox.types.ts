import type {HighlightedSearchResult, LocationInfo} from '../Sidebar.types';

/** Type for props for an infobox about a location. */
export interface InfoboxProps {
  /** The search result corresponding to this location. */
  searchResult: HighlightedSearchResult | null;
  /** */
  showDirectionsOnMap?: (
    startLocationInfo: LocationInfo | undefined,
    endLocationInfo: LocationInfo | undefined
  ) => void;
}
