import type {SearchFieldProps} from '../SearchField';

/** Type for props for rendering a directions search box. */
export interface DirectionsSearchBoxProps {
  /** Default values for the directions search box. */
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
  /** Handles closing the directions search box. */
  onClose?: () => void;
}
