import React, {memo} from 'react';

/**
 * Renders a location icon.
 *
 * This emulates from the `@mui/icons-material/TripOrigin` icon, except the
 * icon's fill and stroke colors are both customizable.
 */
const LocationIcon = ({
  fillColor = 'white',
  strokeColor,
  className,
}: {
  fillColor?: string;
  strokeColor?: string;
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    focusable={false}
    aria-hidden
    style={{
      display: 'inline-block',
      width: '1em',
      height: '1em',
      overflowClipMargin: 'content-box',
      overflow: 'hidden',
      flexShrink: 0,
      msFlexPositive: 0,
      WebkitFlexShrink: 0,
      userSelect: 'none',
      msUserSelect: 'none',
      MozUserSelect: 'none',
      WebkitUserSelect: 'none',
    }}
  >
    <circle
      cx="12"
      cy="12"
      r="8"
      fill={fillColor}
      stroke={strokeColor}
      stroke-width="4"
    />
  </svg>
);

export default memo(LocationIcon);
