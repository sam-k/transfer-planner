import {
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Place as PlaceIcon,
  SwapVert as SwapVertIcon,
  TripOrigin as TripOriginIcon,
} from '@mui/icons-material';
import {Button, IconButton} from '@mui/material';
import {isArray} from 'lodash-es';
import React, {memo, useCallback, useState, type ReactNode} from 'react';

import {filterAndJoin} from '../../../../utils';
import SearchField from '../SearchField';
import './DirectionsSearchBox.css';
import type {DirectionsSearchBoxProps} from './DirectionsSearchBox.types';

/** Placeholder texts for the start and end search fields. */
const placeholderTexts = {
  start: 'Search for a starting point',
  end: 'Search for a destination',
} as const;

/** Renders an icon in a standardized container. */
const IconsContainer = memo(({children}: {children: ReactNode}) => (
  <div
    className={[
      'directionsSearchFields-sideContainer',
      'directionsSearchFields-iconsContainer',
    ].join(' ')}
  >
    {isArray(children) ? (
      children.map((el, i) => (
        <div key={i} className="directionsSearchFields-iconContainer">
          {el}
        </div>
      ))
    ) : (
      <div className="directionsSearchFields-iconContainer">{children}</div>
    )}
  </div>
));

/** Renders a directions search box. */
const DirectionsSearchBox = (props: DirectionsSearchBoxProps) => {
  const {
    defaultValues: {start: defaultStartValue, end: defaultEndValue} = {},
    onStartChange,
    onEndChange,
    onSwap,
    onClose,
  } = props;

  // Whether the start and end locations are swapped.
  const [isSwapped, setIsSwapped] = useState(false);

  /** Handles clicking the button for swapping the start and end locations. */
  const onSwapButtonClick = useCallback(() => {
    setIsSwapped(prevIsSwapped => !prevIsSwapped);
    onSwap?.();
  }, [onSwap]);

  return (
    <div className="directionsSearchBox-container">
      <div className="directionsSearchFields-container">
        <IconsContainer>
          <TripOriginIcon fontSize="small" sx={{color: 'text.secondary'}} />
          <MoreVertIcon className="directionsSearchFields-moreIcon" />
          <PlaceIcon sx={{color: 'error.main'}} />
        </IconsContainer>

        <div
          className={filterAndJoin(
            [
              'directionsSearchFields-fieldsContainer',
              isSwapped
                ? 'directionsSearchFields-fieldsContainer-swapped'
                : undefined,
            ],
            /* sep= */ ' '
          )}
        >
          <SearchField
            classNames={{inputRoot: 'directionsSearchFields-inputRoot'}}
            placeholderText={
              isSwapped ? placeholderTexts.end : placeholderTexts.start
            }
            defaultValue={defaultStartValue}
            onChange={isSwapped ? onEndChange : onStartChange}
            allowSearchingCurrentPos
          />
          <SearchField
            classNames={{inputRoot: 'directionsSearchFields-inputRoot'}}
            placeholderText={
              isSwapped ? placeholderTexts.start : placeholderTexts.end
            }
            defaultValue={defaultEndValue}
            onChange={isSwapped ? onStartChange : onEndChange}
            allowSearchingCurrentPos
          />
        </div>

        <div
          className={[
            'directionsSearchFields-sideContainer',
            'directionsSearchFields-swapButtonContainer',
          ].join(' ')}
        >
          <IconButton
            onClick={() => {
              onSwapButtonClick();
            }}
          >
            <SwapVertIcon sx={{color: 'text.secondary'}} />
          </IconButton>
        </div>
      </div>
      <Button
        className="directionsSearchBox-closeButton"
        variant="contained"
        onClick={() => {
          onClose?.();
        }}
      >
        <CloseIcon fontSize="small" sx={{color: 'text.secondary'}} />
      </Button>
    </div>
  );
};

export default memo(DirectionsSearchBox);
