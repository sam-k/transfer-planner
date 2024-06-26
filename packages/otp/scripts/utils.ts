import {REPO_DIR} from '@internal/constants';
import {configDotenv} from 'dotenv';
import {isObject, transform} from 'lodash-es';
import {join as joinPath} from 'path';

/** Path of the current package. */
export const PKG_DIR = joinPath(REPO_DIR, 'packages/otp');

/** Directory for application-wide configurations. */
export const CONFIG_DIR = joinPath(PKG_DIR, 'config');
/** Directory for fetched data and OpenTripPlanner graphs. */
export const DATA_DIR = joinPath(PKG_DIR, 'data');
/** Directory for empty data and OpenTripPlanner graphs. */
export const EMPTY_DATA_DIR = joinPath(PKG_DIR, 'emptyData');
/** Directory for OpenTripPlanner runtime. */
export const BIN_DIR = joinPath(PKG_DIR, 'bin');
/** Path of generated OpenTripPlanner code. */
export const DIST_DIR = joinPath(PKG_DIR, 'dist');

/** Directory for JSON schemas. */
export const SCHEMA_DIR = joinPath(CONFIG_DIR, 'schemas');

/** Configures `dotenv` for this repository. */
export const configureDotEnv = () => {
  configDotenv({path: joinPath(REPO_DIR, '.env')});
};

/** Recursively omits keys from an object. */
export const deepOmit = <T extends {}>(
  obj: T,
  keysToOmit: string[]
): Partial<T> => {
  const keySetToOmit = new Set(keysToOmit);

  const deepOmitInternal = (obj: Partial<T>): Partial<T> =>
    transform(obj, (res, value, key) => {
      if (keySetToOmit.has(key)) {
        return;
      }
      res[key] = isObject(value) ? deepOmitInternal(value) : value;
    });

  return deepOmitInternal(obj);
};
