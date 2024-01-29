import {isObject, transform} from 'lodash-es';
import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

/** Path of the repository directory. */
export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../..'
);

/**
 * Gets an absolute path from the given paths within the directory.
 *
 * @param {string[]} paths
 * @returns {string}
 */
export const getAbsolutePath = (...paths) => joinPath(REPO_DIR, ...paths);

/**
 * Recursively omits keys from an object.
 *
 * @param {Object} obj
 * @param {string[]} keysToOmit
 * @returns {Object}
 */
export const deepOmit = (obj, keysToOmit) => {
  const keySetToOmit = new Set(keysToOmit);

  const deepOmitInternal = (/** @type {Object} */ obj) => {
    return transform(obj, (res, value, key) => {
      if (keySetToOmit.has(key)) {
        return;
      }
      res[key] = isObject(value) ? deepOmitInternal(value) : value;
    });
  };

  return deepOmitInternal(obj);
};
