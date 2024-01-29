import {isObject, transform} from 'lodash-es';
import {join as joinPath} from 'path';

import {REPO_DIR} from '../constants/index.js';

/**
 * Gets an absolute path from the given path fragments relative to the
 * repository.
 *
 * @param {string[]} paths
 * @returns {string}
 */
export const getAbsolutePath = (...paths) =>
  paths[0]?.startsWith('/')
    ? joinPath(...paths) // Already an absolute path
    : joinPath(REPO_DIR, ...paths);

/**
 * Gets a path as relative to the given path.
 *
 * @param {string} path
 * @param {string=} parentPath
 * @returns {string}
 */
export const getRelativePath = (path, parentPath = REPO_DIR) =>
  path.replace(parentPath, '').replace(/^\//, '');

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
