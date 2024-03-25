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
/** Directory for OpenTripPlanner runtime. */
export const OTP_DIR = joinPath(PKG_DIR, 'otp');

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
