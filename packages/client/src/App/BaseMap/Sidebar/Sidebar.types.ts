import type {AppProps} from '../../App.types';

/** Type for props for rendering the sidebar. */
export type SidebarProps = Pick<AppProps, 'searchApi'>;

/** Information about a fetched location. */
export interface LocationInfo {
  /** Label of this location, usually the place name or the street number. */
  label: string;
  /** Description of this location, usually the remaining full address. */
  description: string;
  /** */
  address: string;
  /** Latitude of this location. */
  latitude: number;
  /** Longitude of this location. */
  longitude: number;
  /** Attribution for how this location information was obtained. */
  attribution: string;
}
