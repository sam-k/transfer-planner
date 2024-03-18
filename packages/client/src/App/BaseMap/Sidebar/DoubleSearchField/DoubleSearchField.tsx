import {
  MoreVert as MoreVertIcon,
  Place as PlaceIcon,
  SwapVert as SwapVertIcon,
  TripOrigin as TripOriginIcon,
} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import {isArray} from 'lodash-es';
import React, {memo, useCallback, useState, type ReactNode} from 'react';

import {filterAndJoin} from '../../../../utils';
import SearchField from '../SearchField';
import './DoubleSearchField.css';
import type {DoubleSearchFieldProps} from './DoubleSearchField.types';

/** */
const placeholderTexts = {
  start: 'Search for a starting point',
  end: 'Search for a destination',
} as const;

/** */
const IconsContainer = memo(({children}: {children: ReactNode}) => (
  <div
    className={[
      'doubleSearchField-sideContainer',
      'doubleSearchField-iconsContainer',
    ].join(' ')}
  >
    {isArray(children) ? (
      children.map((el, i) => (
        <div key={i} className="doubleSearchField-iconContainer">
          {el}
        </div>
      ))
    ) : (
      <div className="doubleSearchField-iconContainer">{children}</div>
    )}
  </div>
));

/** */
const DoubleSearchField = (props: DoubleSearchFieldProps) => {
  const {
    defaultValues: {start: defaultStartValue, end: defaultEndValue} = {},
    onStartChange,
    onEndChange,
    onSwap,
  } = props;

  //
  const [isSwapped, setIsSwapped] = useState(false);

  /** */
  const onSwapButtonClick = useCallback(() => {
    setIsSwapped(prevIsSwapped => !prevIsSwapped);
    onSwap?.();
  }, [onSwap]);

  return (
    <div className="doubleSearchField-container">
      <IconsContainer>
        <TripOriginIcon fontSize="small" sx={{color: 'text.secondary'}} />
        <MoreVertIcon className="doubleSearchField-moreIcon" />
        <PlaceIcon sx={{color: 'error.main'}} />
      </IconsContainer>

      <div
        className={filterAndJoin(
          [
            'doubleSearchField-fieldsContainer',
            isSwapped ? 'doubleSearchField-fieldsContainer-swapped' : undefined,
          ],
          /* sep= */ ' '
        )}
      >
        <SearchField
          classNames={{inputRoot: 'doubleSearchField-inputRoot'}}
          placeholderText={
            isSwapped ? placeholderTexts.end : placeholderTexts.start
          }
          defaultValue={defaultStartValue}
          onChange={isSwapped ? onEndChange : onStartChange}
          allowSearchingCurrentPos
        />
        <SearchField
          classNames={{inputRoot: 'doubleSearchField-inputRoot'}}
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
          'doubleSearchField-sideContainer',
          'doubleSearchField-swapButtonContainer',
        ].join(' ')}
      >
        <IconButton onClick={onSwapButtonClick}>
          <SwapVertIcon sx={{color: 'text.secondary'}} />
        </IconButton>
      </div>
    </div>
  );
};

export default memo(DoubleSearchField);
