import {debounce} from 'lodash-es';

/**
 * URL for the local API server.
 *
 * TODO: Fetch port instead of hardcoding.
 */
export const API_SERVER_URL = 'http://localhost:3000';

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
