import {compileJsonSchemasInDir, generateOtpSchema} from './tasks';
import {SCHEMA_DIR} from './utils';

const main = async () => {
  await compileJsonSchemasInDir(SCHEMA_DIR);
  await generateOtpSchema();
};

main();
