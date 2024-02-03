import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
