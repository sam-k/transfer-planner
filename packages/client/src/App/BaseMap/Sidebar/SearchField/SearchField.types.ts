import type {AutocompleteClasses} from '@mui/material';

import type {HighlightedSearchResult} from '../Sidebar.types';

/** Type for props for the location search field. */
export interface SearchFieldProps {
  /** Class names to apply to the search field. */
  classNames?: Partial<AutocompleteClasses>;
  /** Placeholder text for this search field. */
  placeholderText?: string;
  /** Default value for the search field. */
  defaultValue?: {
    /** Default text input. */
    textInput?: string;
    /** Default selected search result. */
    selectedSearchResult?: HighlightedSearchResult | null;
    /** Default fetched search results. */
    searchResults?: ReadonlySet<HighlightedSearchResult>;
  };
  /** Handles changing the selected search result. */
  onChange?: (
    newValue: HighlightedSearchResult | null,
    searchResults: ReadonlySet<HighlightedSearchResult>
  ) => void;
  /** Whether to allow searching for the current location. */
  allowSearchingCurrentPos?: boolean;
}
