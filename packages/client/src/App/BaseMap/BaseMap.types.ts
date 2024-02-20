import type {AppProps} from '../App.types';

/** Type for props for the application's base map. */
export type BaseMapProps = Pick<AppProps, 'tileApi' | 'defaultCenter'>;
