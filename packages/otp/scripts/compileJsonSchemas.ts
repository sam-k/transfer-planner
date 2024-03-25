import {getArgs, handleError, printUsage} from '@internal/script-utils';
import {join as joinPath} from 'path';

import {compileAllSchemasInDir} from './tasks';
import {CONFIG_DIR} from './utils';

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
