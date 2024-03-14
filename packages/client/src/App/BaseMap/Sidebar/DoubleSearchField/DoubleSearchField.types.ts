import type {SearchFieldProps} from '../SearchField';

/** */
export interface DoubleSearchFieldProps {
  /** */
  onStartChange?: SearchFieldProps['onChange'];
  /** */
  onEndChange?: SearchFieldProps['onChange'];
  /** */
  onSwap?: () => void;
}
