import type {SearchFieldProps} from '../SearchField';

/** */
export interface DoubleSearchFieldProps {
  /** */
  defaultValues?: {
    /** */
    start?: SearchFieldProps['defaultValue'];
    /** */
    end?: SearchFieldProps['defaultValue'];
  };
  /** */
  onStartChange?: SearchFieldProps['onChange'];
  /** */
  onEndChange?: SearchFieldProps['onChange'];
  /** */
  onSwap?: () => void;
}
