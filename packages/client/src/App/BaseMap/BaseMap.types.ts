import type {AppProps} from '../App.types';
import type {MarkerProps} from './Marker';

/** Type for props for the application's base map. */
export type BaseMapProps = AppProps;

/** Type for props for rendering start and end map markers for directions. */
export interface DirectionsMarkerProps {
  /** Type for props for rendering the start map marker. */
  start: MarkerProps;
  /** Type for props for rendering the end map marker. */
  end: MarkerProps;
}
