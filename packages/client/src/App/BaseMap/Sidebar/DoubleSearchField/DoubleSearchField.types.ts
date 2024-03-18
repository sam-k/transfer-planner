import type {SearchFieldProps} from '../SearchField';

/** Type for props for rendering a directions search field. */
export interface DoubleSearchFieldProps {
  /** Default values for the directions search field. */
  defaultValues?: {
    /** Default value for the start search field. */
    start?: SearchFieldProps['defaultValue'];
    /** Default value for the end search field. */
    end?: SearchFieldProps['defaultValue'];
  };
  /** Handles changing the selected start search result. */
  onStartChange?: SearchFieldProps['onChange'];
  /** Handles changing the selected end search result. */
  onEndChange?: SearchFieldProps['onChange'];
  /** Handles swapping the selected start and end search results. */
  onSwap?: () => void;
}
