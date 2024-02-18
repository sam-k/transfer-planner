import {debounce} from 'lodash-es';

/** Parses a string as a float, and returns the value only if valid. */
export const parseAndCheckFloat = (floatStr: unknown) => {
  if (typeof floatStr !== 'string') {
    return undefined;
  }
  const floatVal = parseFloat(floatStr);
  return isNaN(floatVal) ? undefined : floatVal;
};

/**
 * Calculates the haversine distance between two coordinates.
 *
 * @param coordsDeg Latitude 1, longitude 1, latitude 2, longitude 2, all in
 * degrees
 * @returns Distance in km
 */
export const getHaversineDistKm = (
  ...coordsDeg: [number, number, number, number]
) => {
  const [lat1, lon1, lat2, lon2] = coordsDeg.map(
    coord => (coord * Math.PI) / 180 // Convert to radians
  );
  return (
    2 *
    6371 * // Earth's approximate average radius, in km
    Math.asin(
      Math.sqrt(
        Math.sin((lat1 - lat2) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon1 - lon2) / 2) ** 2
      )
    )
  );
};

/** */
export const convertDdToDmsCoords = (
  latDd: number,
  lonDd: number,
  secondsDecimalPlaces = 3
): string => {
  const ddToDms = (dd: number): {deg: number; min: number; sec: number} => {
    const deg = Math.trunc(dd);
    const min = Math.trunc((dd - deg) * 60);
    const sec =
      Math.round(((dd - deg) * 60 - min) * 60 * 10 ** secondsDecimalPlaces) /
      10 ** secondsDecimalPlaces;

    return {deg, min, sec};
  };

  const latDms = ddToDms(Math.abs(latDd));
  const lonDms = ddToDms(Math.abs(lonDd));

  return [
    `${latDms.deg}°${latDms.min}′${latDms.sec}″${latDd >= 0 ? 'N' : 'S'}`,
    `${lonDms.deg}°${lonDms.min}′${lonDms.sec}″${lonDd >= 0 ? 'E' : 'W'}`,
  ].join(', ');
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
