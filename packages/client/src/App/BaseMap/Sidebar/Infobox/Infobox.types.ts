import type {SearchResult} from '../SearchField';

/** Type for props for an infobox about a location. */
export interface InfoboxProps {
  /** The search result corresponding to this location. */
  searchResult: SearchResult | null;
}
