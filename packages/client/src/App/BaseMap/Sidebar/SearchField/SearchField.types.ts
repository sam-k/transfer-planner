import type {AutocompleteClasses} from '@mui/material';

import type {HighlightedSearchResult} from '../Sidebar.types';

/** Type for props for the location search field. */
export interface SearchFieldProps {
  /** */
  classNames?: Partial<AutocompleteClasses>;
  /** */
  placeholderText?: string;
  /** */
  onChange?: (newValue: HighlightedSearchResult | null) => void;
}
