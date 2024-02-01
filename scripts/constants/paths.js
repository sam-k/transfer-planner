import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

import {getAbsolutePath} from '../utils/index.js';

/** Path of the repository directory. */
export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../..'
);

/** Directory for application-wide configurations. */
export const CONFIG_DIR = getAbsolutePath('config');
/** Directory for fetched data and OpenTripPlanner graphs. */
export const DATA_DIR = getAbsolutePath('data');
/** Directory for OpenTripPlanner runtime. */
export const OTP_DIR = getAbsolutePath('otp');
