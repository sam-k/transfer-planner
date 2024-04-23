/** Type for mode of scheduling directions. */
export type ScheduleMode = 'now' | 'leaveAt' | 'arriveBy';

/** Type for props for rendering time-scheduling directions. */
export interface DirectionsTimeBoxProps {
  /** Handles changing the time for directions. */
  onTimeChange?: (newTime: Date) => void;
  /** Handles changing the date for directions. */
  onDateChange?: (newDate: Date) => void;
  /** Handles changing the scheduling mode for directions. */
  onModeChange?: (newMode: ScheduleMode) => void;
}
