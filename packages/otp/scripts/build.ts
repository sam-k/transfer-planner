import {handleError} from '@internal/script-utils';

import {compileJsonSchemasInDir, generateOtpSchema} from './tasks';
import {SCHEMA_DIR} from './utils';

const main = async () => {
  try {
    await compileJsonSchemasInDir(SCHEMA_DIR);
    await generateOtpSchema();
  } catch (err) {
    handleError(err);
  }
};

main();
