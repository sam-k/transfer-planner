import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

/** Path of the repository directory. */
export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/** Default port for this server. */
export const DEFAULT_PORT = 3000;
