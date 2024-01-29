import {createWriteStream, readFileSync, unlinkSync, writeFile} from 'fs';
import {globSync} from 'glob';
import {compile} from 'json-schema-to-typescript';
import {
  basename,
  format as formatPath,
  join as joinPath,
  parse as parsePath,
} from 'path';

import {deepOmit, getAbsolutePath, handleError} from '../utils/index.js';

const SCHEMA_DIR_PATHS = ['./config/schemas'].map(path =>
  getAbsolutePath(path)
);

/**
 * Compiles all JSON schemas in a directory.
 *
 * @param {string} dirPath
 */
const compileAllSchemasInDir = async dirPath => {
  const indexPath = joinPath(dirPath, 'index.d.ts');
  const schemaPaths = globSync(joinPath(dirPath, '*.schema.json'));

  try {
    unlinkSync(indexPath);
  } catch {
    // Ignore if file does not exist.
  }
  const indexFs = createWriteStream(indexPath, {flags: 'a'});

  await Promise.all(
    schemaPaths.map(
      /** @returns {Promise<void>} */ async schemaPath => {
        const schemaJson = deepOmit(
          JSON.parse(readFileSync(schemaPath).toString()),
          // json-schema-to-typescript cannot handle schema composition.
          ['allOf', 'anyOf', 'oneOf']
        );
        const declarationPath = formatPath({
          ...parsePath(schemaPath),
          base: '',
          ext: '.d.ts',
        });
        const compiled = await compile(
          schemaJson,
          basename(schemaPath, /* suffix= */ '.schema.json')
        );
        writeFile(declarationPath, compiled, err => {
          if (err) {
            throw err;
          }
        });
        indexFs.write(`export type * from './${basename(declarationPath)}';\n`);
      }
    )
  );
};

const main = async () => {
  try {
    await Promise.all(
      SCHEMA_DIR_PATHS.map(dirPath => compileAllSchemasInDir(dirPath))
    );
  } catch (err) {
    handleError(err);
  }
};

main();
