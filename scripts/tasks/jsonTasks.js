import chalk from 'chalk';
import {
  createWriteStream,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFile,
} from 'fs';
import {globSync} from 'glob';
import {compile} from 'json-schema-to-typescript';
import {
  basename,
  format as formatPath,
  join as joinPath,
  parse as parsePath,
} from 'path';

import {
  deepOmit,
  getRelativePath,
  printInfo,
  printWarn,
} from '../utils/index.js';

/**
 * Compiles all JSON schemas in a directory.
 *
 * @param {string} dirPath
 */
export const compileAllSchemasInDir = async dirPath => {
  const indexPath = joinPath(dirPath, 'index.d.ts');
  const schemaPaths = globSync(joinPath(dirPath, '*.schema.json')).sort();

  if (existsSync(indexPath)) {
    printWarn(
      `Deleting existing index file in ${chalk.bold(
        getRelativePath(dirPath)
      )}...`
    );
    unlinkSync(indexPath);
  }

  const existingSchemaPaths = schemaPaths.filter(existsSync);
  if (existingSchemaPaths.length) {
    printWarn(
      `Deleting existing JSON schemas in ${chalk.bold(
        getRelativePath(dirPath)
      )}...`,
      ...existingSchemaPaths.map(
        schemaPath => `- ${getRelativePath(schemaPath, dirPath)}`
      )
    );
    // No need to delete explicitly, as `fs.writeFile` will replace files that
    // already exist.
  }
  printInfo(
    `Compiling all JSON schemas in ${chalk.bold(getRelativePath(dirPath))}...`,
    ...schemaPaths.map(
      schemaPath => `- ${getRelativePath(schemaPath, dirPath)}`
    )
  );

  const indexFs = createWriteStream(indexPath, {flags: 'a'});
  await Promise.all(
    schemaPaths.map(async schemaPath => {
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
    })
  );
};
