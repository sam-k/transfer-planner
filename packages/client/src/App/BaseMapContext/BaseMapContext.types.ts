import type {Dispatch, ProviderProps, SetStateAction} from 'react';

import type {MarkerProps} from '../BaseMap/Marker';

/** Type for the value provided by `BaseMapContext`. */
export interface BaseMapContextValue {
  /** Sets the map markers state. */
  setMarkers?: Dispatch<SetStateAction<ReadonlyArray<MarkerProps>>>;
}

/** Type for props for the `BaseMapContext` provider. */
export interface BaseMapContextProviderProps extends BaseMapContextValue {
  /** Child components to be wrapped within the `BaseMapContext` provider. */
  children: ProviderProps<BaseMapContextValue>['children'];
}
