import type {Dispatch, ProviderProps, SetStateAction} from 'react';
import {MarkerProps} from '../BaseMap/Marker';

/** Type for the value provided by `AppContext`. */
export interface BaseMapContextValue {
  /** */
  setMarkers?: Dispatch<SetStateAction<ReadonlyArray<MarkerProps>>>;
}

/** Type for props for the `BaseMapContext` provider. */
export interface BaseMapContextProviderProps extends BaseMapContextValue {
  /** Child components to be wrapped within the `BaseMapContext` provider. */
  children: ProviderProps<BaseMapContextValue>['children'];
}
