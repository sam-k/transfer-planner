import type {ProviderProps} from 'react';

import type {AppProps} from '../App';

/** Type for the value provided by `AppContext`. */
export type AppContextValue = Pick<AppProps, 'boundingBox'>;

/** Type for props for the `AppContext` provider. */
export interface AppContextProviderProps extends AppContextValue {
  /** Child components to be wrapped within the `AppContext` provider. */
  children: ProviderProps<AppContextValue>['children'];
}
