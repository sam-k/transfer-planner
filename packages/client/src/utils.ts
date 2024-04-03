import Color from 'color';
import {debounce, inRange} from 'lodash-es';

import type {LatLngBounds, LatLngCoords} from './types';

/** Parses a string as a float, and returns the value only if valid. */
export const parseAndCheckFloat = (floatStr: unknown) => {
  if (typeof floatStr !== 'string') {
    return undefined;
  }
  const floatVal = parseFloat(floatStr);
  return isNaN(floatVal) ? undefined : floatVal;
};

/** Filters an array for truthy values, then joins it by the given separator. */
export const filterAndJoin = (arr: unknown[], sep: string) =>
  arr.filter(Boolean).join(sep);

/** Calculates the haversine distance between two coordinates, in kilometers. */
export const getHaversineDistKm = (
  coords1: LatLngCoords,
  coords2: LatLngCoords
) => {
  const degToRad = (coord: number) => (coord * Math.PI) / 180;

  const [lat1Rad, lon1Rad] = coords1.map(degToRad);
  const [lat2Rad, lon2Rad] = coords2.map(degToRad);

  return (
    2 *
    6371 * // Earth's approximate average radius, in km
    Math.asin(
      Math.sqrt(
        Math.sin((lat1Rad - lat2Rad) / 2) ** 2 +
          Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin((lon1Rad - lon2Rad) / 2) ** 2
      )
    )
  );
};

/**
 * Converts coordinates from decimal degrees to degrees–minutes–seconds, with
 * cardinal directions.
 *
 * @param secondsDecimalPlaces Number of decimal places to include in the
 * seconds place
 */
export const convertDdToDmsCoords = (
  coordsDd: LatLngCoords,
  secondsDecimalPlaces = 3
): string => {
  const [latDd, lonDd] = coordsDd;
  const [latDms, lonDms] = coordsDd.map(coordDd => {
    const absDd = Math.abs(coordDd);

    const deg = Math.trunc(absDd);
    const min = Math.trunc((absDd - deg) * 60);
    const sec =
      Math.round(((absDd - deg) * 60 - min) * 60 * 10 ** secondsDecimalPlaces) /
      10 ** secondsDecimalPlaces;

    return {deg, min, sec};
  });

  return [
    `${latDms.deg}°${latDms.min}′${latDms.sec}″${latDd >= 0 ? 'N' : 'S'}`,
    `${lonDms.deg}°${lonDms.min}′${lonDms.sec}″${lonDd >= 0 ? 'E' : 'W'}`,
  ].join(', ');
};

/** Checks whether coordinates lie within the bounding box. */
export const areCoordsInBounds = (
  coords: LatLngCoords,
  boundingBox: LatLngBounds
) => {
  const [lat, lon] = coords;
  const [[latBound1, lonBound1], [latBound2, lonBound2]] = boundingBox;

  return (
    inRange(lat, latBound1, latBound2) && inRange(lon, lonBound1, lonBound2)
  );
};

/** Caps a color's saturation. */
export const capColorSaturation = (
  /** RGB color in hex. (e.g., #FF0000) */
  rgbColorStr: string,
  /** Cap for the saturation as a percentage. (e.g., 90%) */
  saturationCap = 90
): string => {
  const hslColor = Color(
    rgbColorStr.charAt(0) === '#' ? rgbColorStr : `#${rgbColorStr}`
  ).hsl();

  return Color.hsl(
    hslColor.hue(),
    Math.min(hslColor.saturationl(), saturationCap),
    hslColor.lightness()
  ).hex();
};

/** Creates an asynchronous debounced function. */
export const debounceAsync = <TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => Promise<TReturn>,
  wait: number,
  options?: {
    /**
     * Callback to run before the first call to the debounced function is
     * invoked.
     */
    leadingCallback?: () => void;
    /**
     * Callback to run after the last call to the debounced function is
     * resolved.
     */
    trailingCallback?: () => void;
  }
) => {
  const {leadingCallback, trailingCallback} = options ?? {};

  // Separate the debouncing from the promise return. This prevents the
  // debounced function from returning a stale promise that cannot be settled.
  const debouncedFunc = debounce((resolve, reject, args) => {
    func(...args)
      .then(resolve)
      .catch(reject)
      .finally(trailingCallback);
  }, wait);

  return (...args: TArgs) => {
    leadingCallback?.();
    return new Promise<TReturn>((resolve, reject) =>
      debouncedFunc(resolve, reject, args)
    );
  };
};
