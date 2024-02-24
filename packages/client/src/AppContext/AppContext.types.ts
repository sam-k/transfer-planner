import type {ProviderProps} from 'react';

import type {AppProps} from '../App';

/** Type for the value provided by `AppContext`. */
export interface AppContextValue
  extends Pick<AppProps, 'tileApi' | 'searchApi' | 'boundingBox'> {
  /** Current position of the user device. */
  currentPos?: GeolocationPosition;
}

/** Type for props for the `AppContext` provider. */
export interface AppContextProviderProps extends AppContextValue {
  /** Child components to be wrapped within the `AppContext` provider. */
  children: ProviderProps<AppContextValue>['children'];
}
