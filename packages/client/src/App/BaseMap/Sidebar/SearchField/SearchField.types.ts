import type {HighlightedSearchResult} from '../Sidebar.types';

/** Type for props for the location search field. */
export interface SearchFieldProps {
  /** */
  onChange?: (newValue: HighlightedSearchResult | null) => void;
}
