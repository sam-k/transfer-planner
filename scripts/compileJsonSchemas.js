import {join as joinPath} from 'path';

import {CONFIG_DIR} from './constants/paths.js';
import {compileAllSchemasInDir} from './tasks/index.js';
import {getArgs, handleError, printUsage} from './utils/index.js';

/** Directory for JSON schemas. */
export const SCHEMA_DIRS = [joinPath(CONFIG_DIR, 'schemas')];

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['compile-json-schemas']);
    return;
  }

  try {
    await Promise.all(SCHEMA_DIRS.map(dir => compileAllSchemasInDir(dir)));
  } catch (err) {
    handleError(err);
  }
};

main();
