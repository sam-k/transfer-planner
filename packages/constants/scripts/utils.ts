import {createWriteStream, writeFile} from 'fs';
import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

/** Path of the repository directory. */
export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/** Path of the current package. */
export const PKG_DIR = joinPath(REPO_DIR, 'packages/constants');

/** Path of the generated distribution directory. */
export const DIST_DIR = joinPath(PKG_DIR, 'dist');

/**
 * Writes content and its declaration to a file.
 *
 * @param baseName Base name of the file, without extension
 */
export const writeContentWithDecl = (
  baseName: string,
  content: string,
  declContent: string
) => {
  const writeData = (name: string, data: string) => {
    writeFile(joinPath(DIST_DIR, name), data, err => {
      if (err) {
        throw err;
      }
    });
  };

  writeData(`${baseName}.js`, content);
  createWriteStream(joinPath(DIST_DIR, 'index.js'), {flags: 'a'}).write(
    `export * from './${baseName}.js';\n`
  );

  writeData(`${baseName}.d.ts`, declContent);
  createWriteStream(joinPath(DIST_DIR, 'index.d.ts'), {flags: 'a'}).write(
    `export * from './${baseName}';\n`
  );
};

/**
 * Writes primitives and their declaration to a file.
 *
 * @param {string} baseName Base name of the file, without extension
 */
export const writePrimitivesWithDecl = (
  baseName: string,
  primitives: Array<{
    name: string;
    value: string | number | boolean;
    comment?: string;
  }>
) => {
  writeContentWithDecl(
    baseName,
    primitives
      .map(
        ({name, value}) => `export const ${name} = ${JSON.stringify(value)};`
      )
      .join('\n'),
    primitives
      .map(({name, value, comment}) =>
        [`/** ${comment} */`, `export const ${name}: ${typeof value};`]
          .filter(Boolean)
          .join('\n')
      )
      .join('\n')
  );
};
