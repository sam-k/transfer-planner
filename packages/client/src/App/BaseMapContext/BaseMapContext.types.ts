import type {Map as LeafletMap} from 'leaflet';
import type {ProviderProps, RefObject} from 'react';

import type {SetState} from '../../types';
import type {BaseMapProps, DirectionsMarkerProps} from '../BaseMap';
import type {MarkerProps} from '../BaseMap/Marker';
import type {PolylineProps} from '../BaseMap/Polyline';

/** Type for the value provided by `BaseMapContext`. */
export interface BaseMapContextValue
  extends Pick<BaseMapProps, 'tileApi' | 'searchApi' | 'boundingBox'> {
  /** Current position of the user device. */
  currentPos?: GeolocationPosition;
  /** Reference to the map. */
  mapRef?: RefObject<LeafletMap | undefined>;
  /** Sets the map marker state. */
  setMarker?: SetState<MarkerProps>;
  /** Sets the start and end map marker state for directions. */
  setDirectionsMarkers?: SetState<DirectionsMarkerProps>;
  /** Sets the polylines state for directions. */
  setDirectionsPolylines?: SetState<PolylineProps[]>;
}

/** Type for props for the `BaseMapContext` provider. */
export interface BaseMapContextProviderProps extends BaseMapContextValue {
  /** Child components to be wrapped within the `BaseMapContext` provider. */
  children: ProviderProps<BaseMapContextValue>['children'];
}
