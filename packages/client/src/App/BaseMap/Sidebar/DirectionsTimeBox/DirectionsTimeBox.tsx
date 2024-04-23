import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonProps,
} from '@mui/material';
import {DatePicker, TimePicker} from '@mui/x-date-pickers';
import {isValid as isValidDateTime} from 'date-fns';
import React, {memo, useCallback, useEffect, useState} from 'react';

import {filterAndJoin} from '../../../../utils';
import './DirectionsTimeBox.css';
import type {
  DirectionsTimeBoxProps,
  ScheduleMode,
} from './DirectionsTimeBox.types';

/** Renders a directions time-scheduling box. */
const DirectionsTimeBox = (props: DirectionsTimeBoxProps) => {
  const {onTimeChange, onDateChange, onModeChange} = props;

  useEffect(() => {
    onTimeChange?.(new Date());
    onDateChange?.(new Date());
    onModeChange?.('now');
    // Run only upon initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');

  /** Gets props to supply to each `ToggleButton` option. */
  const getOptionProps = useCallback(
    ({
      isFirst,
      isLast,
    }:
      | {isFirst?: boolean; isLast?: boolean}
      | undefined = {}): Partial<ToggleButtonProps> => {
      const areDateTimeFieldsShown = scheduleMode !== 'now';
      return {
        className: filterAndJoin(
          [
            'directionsTimeBox-option',
            isFirst
              ? areDateTimeFieldsShown
                ? 'directionsTimeBox-option-firstWithDateTimeShown'
                : 'directionsTimeBox-option-firstWithDateTimeHidden'
              : undefined,
            isLast
              ? areDateTimeFieldsShown
                ? 'directionsTimeBox-option-lastWithDateTimeShown'
                : 'directionsTimeBox-option-lastWithDateTimeHidden'
              : 'directionsTimeBox-option-moreNext',
          ],
          /* sep= */ ' '
        ),
        sx: {color: 'text.primary'},
      };
    },
    [scheduleMode]
  );

  return (
    <div className="directionsTimeBox">
      <ToggleButtonGroup
        value={scheduleMode}
        exclusive
        color="primary"
        fullWidth
        onChange={(_, newMode) => {
          setScheduleMode(newMode);
          onModeChange?.(newMode);
        }}
      >
        <ToggleButton value="now" {...getOptionProps({isFirst: true})}>
          Leave now
        </ToggleButton>
        <ToggleButton value="leaveAt" {...getOptionProps()}>
          Leave at…
        </ToggleButton>
        <ToggleButton value="arriveBy" {...getOptionProps({isLast: true})}>
          Arrive by…
        </ToggleButton>
      </ToggleButtonGroup>
      {scheduleMode !== 'now' && (
        <div className="directionsTimeBox-dateTime">
          <TimePicker
            className={[
              'directionsTimeBox-dateTime-field',
              'directionsTimeBox-dateTime-timeField',
            ].join(' ')}
            defaultValue={new Date()}
            format="h:mm aa"
            onChange={newTime => {
              if (!newTime || !isValidDateTime(newTime)) {
                return;
              }
              onTimeChange?.(newTime);
            }}
            slotProps={{
              field: {shouldRespectLeadingZeros: true},
              popper: {disablePortal: true},
            }}
          />
          <DatePicker
            className={[
              'directionsTimeBox-dateTime-field',
              'directionsTimeBox-dateTime-dateField',
            ].join(' ')}
            defaultValue={new Date()}
            format="MMM d, yyyy"
            onChange={newDate => {
              if (!newDate || !isValidDateTime(newDate)) {
                return;
              }
              onDateChange?.(newDate);
            }}
            slotProps={{
              field: {shouldRespectLeadingZeros: true},
              popper: {disablePortal: true},
            }}
          />
        </div>
      )}
    </div>
  );
};

export default memo(DirectionsTimeBox);
