import {getArgs, handleError, printUsage} from '@internal/script-utils';

import {compileJsonSchemasInDir} from './tasks';
import {SCHEMA_DIR} from './utils';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['compile-json-schemas']);
    return;
  }

  try {
    await compileJsonSchemasInDir(SCHEMA_DIR);
  } catch (err) {
    handleError(err);
  }
};

main();
