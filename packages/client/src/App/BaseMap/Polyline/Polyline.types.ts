import type {LatLngCoords} from '../../../types';

/** Type for props for rendering a polyline. */
export interface PolylineProps {
  /** List of coordinates along the polyline. */
  coordsList: LatLngCoords[];
  /** Color of the polyline. */
  color?: string;
  /** Whether this polyline represents a transit route. */
  isTransit?: boolean;
}
