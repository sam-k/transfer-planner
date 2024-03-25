import {getRelativePath, printInfo, printWarn} from '@internal/script-utils';
import {
  createWriteStream,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFile,
} from 'fs';
import {globSync} from 'glob';
import {compile, type JSONSchema} from 'json-schema-to-typescript';
import {
  basename as basenamePath,
  format as formatPath,
  join as joinPath,
  parse as parsePath,
} from 'path';

import {deepOmit, PKG_DIR} from '../utils';

/** Compiles all JSON schemas in a directory. */
export const compileAllSchemasInDir = async (dirPath: string) => {
  const indexPath = joinPath(dirPath, 'index.d.ts');
  const schemaPaths = globSync(joinPath(dirPath, '*.schema.json')).sort();

  if (existsSync(indexPath)) {
    printWarn(
      `Deleting existing index file in ${getRelativePath({
        path: dirPath,
        parentPath: PKG_DIR,
      })}...`
    );
    unlinkSync(indexPath);
  }

  const existingSchemaPaths = schemaPaths.filter(existsSync);
  if (existingSchemaPaths.length) {
    printWarn(
      `Deleting existing compiled JSON schemas in ${getRelativePath({
        path: dirPath,
        parentPath: PKG_DIR,
      })} for...`,
      ...existingSchemaPaths.map(
        schemaPath =>
          `- ${getRelativePath({path: schemaPath, parentPath: dirPath})}`
      )
    );
    // No need to delete explicitly, as `fs.writeFile` will replace files that
    // already exist.
  }
  printInfo(
    `Compiling all JSON schemas in ${getRelativePath({
      path: dirPath,
      parentPath: PKG_DIR,
    })}...`,
    ...schemaPaths.map(
      schemaPath =>
        `- ${getRelativePath({path: schemaPath, parentPath: dirPath})}`
    )
  );

  const indexFs = createWriteStream(indexPath, {flags: 'a'});
  await Promise.all(
    schemaPaths.map(async schemaPath => {
      const schemaJson = deepOmit(
        JSON.parse(readFileSync(schemaPath).toString()),
        // json-schema-to-typescript cannot handle schema composition.
        ['allOf', 'anyOf', 'oneOf']
      ) as JSONSchema;
      const declarationPath = formatPath({
        ...parsePath(schemaPath),
        base: '',
        ext: '.d.ts',
      });
      const compiled = await compile(
        schemaJson,
        basenamePath(schemaPath, /* suffix= */ '.schema.json')
      );
      writeFile(declarationPath, compiled, err => {
        if (err) {
          throw err;
        }
      });
      indexFs.write(
        `export type * from './${basenamePath(declarationPath)}';\n`
      );
    })
  );
};
