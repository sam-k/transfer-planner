import {useCallback, useState, type RefCallback} from 'react';

/**
 * Provides tools for calculating negative offset to accommodate a location
 * icon.
 */
const useNegativeOffset = () => {
  // Absolute value of the offset, in pixels.
  const [offsetPx, setOffsetPx] = useState(0);

  /** Callback reference to the relevant location summary. */
  const ref = useCallback<RefCallback<HTMLDivElement>>(el => {
    if (!el) {
      return;
    }
    // Location icon SVG is 13.33px tall.
    // Add an extra pixel to be safe.
    setOffsetPx((el.getBoundingClientRect().height - 13.33) / 2 + 1);
  }, []);

  return {ref, offsetPx};
};

export default useNegativeOffset;
