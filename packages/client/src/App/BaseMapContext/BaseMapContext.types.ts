import type {Map as LeafletMap} from 'leaflet';
import type {Dispatch, ProviderProps, RefObject, SetStateAction} from 'react';

import type {BaseMapProps} from '../BaseMap';
import type {MarkerProps} from '../BaseMap/Marker';

/** Type for the value provided by `BaseMapContext`. */
export interface BaseMapContextValue extends Pick<BaseMapProps, 'boundingBox'> {
  /** Current position of the user device. */
  currentPos?: GeolocationPosition;
  /** Reference to the map. */
  mapRef?: RefObject<LeafletMap | undefined>;
  /** Sets the map marker state. */
  setMarker?: Dispatch<SetStateAction<MarkerProps | undefined>>;
  /** Sets the start map marker state for directions. */
  setStartMarker?: Dispatch<SetStateAction<MarkerProps | undefined>>;
  /** Sets the end map marker state for directions. */
  setEndMarker?: Dispatch<SetStateAction<MarkerProps | undefined>>;
}

/** Type for props for the `BaseMapContext` provider. */
export interface BaseMapContextProviderProps extends BaseMapContextValue {
  /** Child components to be wrapped within the `BaseMapContext` provider. */
  children: ProviderProps<BaseMapContextValue>['children'];
}
