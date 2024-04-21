import type {Dispatch, SetStateAction} from 'react';

/**
 * Type for coordinates of form `[latitude, longitude]`.
 *
 * This is more restrictive than Leaflet's `LatLngExpression`.
 */
export type LatLngCoords = [number, number];

/**
 * Type for coordinate bounds of form
 * `[[latitude, longitude], [latitude, longitude]]`.
 *
 * This is more restrictive than Leaflet's `LatLngBoundsExpression`.
 */
export type LatLngBounds = [LatLngCoords, LatLngCoords];

/** Type for a React state-setter. */
export type SetState<T> = Dispatch<SetStateAction<T | undefined>>;
