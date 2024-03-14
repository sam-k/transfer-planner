import {
  MoreVert as MoreVertIcon,
  Place as PlaceIcon,
  SwapVert as SwapVertIcon,
  TripOrigin as TripOriginIcon,
} from '@mui/icons-material';
import {IconButton} from '@mui/material';
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {isArray} from 'lodash-es';
import {filterAndJoin} from '../../../../utils';
import SearchField from '../SearchField';
import './DoubleSearchField.css';
import type {DoubleSearchFieldProps} from './DoubleSearchField.types';

/** */
const IconsContainer = ({children}: {children: ReactNode}) => (
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
);

/** */
const DoubleSearchField = (props: DoubleSearchFieldProps) => {
  const {onStartChange, onEndChange, onSwap} = props;

  //
  const [isSwapped, setIsSwapped] = useState(false);

  /** */
  const placeholderTexts = useMemo(
    () => ({
      start: 'Search for a starting point',
      end: 'Search for a destination',
    }),
    []
  );

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
            isSwapped ? 'doubleSearchField-fieldsContainer-swapped' : '',
          ],
          /* sep= */ ' '
        )}
      >
        <SearchField
          classNames={{inputRoot: 'doubleSearchField-inputRoot'}}
          placeholderText={
            isSwapped ? placeholderTexts.end : placeholderTexts.start
          }
          onChange={isSwapped ? onEndChange : onStartChange}
        />
        <SearchField
          classNames={{inputRoot: 'doubleSearchField-inputRoot'}}
          placeholderText={
            isSwapped ? placeholderTexts.start : placeholderTexts.end
          }
          onChange={isSwapped ? onStartChange : onEndChange}
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
