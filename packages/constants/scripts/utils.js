import {createWriteStream, existsSync, unlinkSync, writeFile} from 'fs';
import {dirname, join as joinPath} from 'path';
import {fileURLToPath} from 'url';

/** Path of the repository directory. */
export const REPO_DIR = joinPath(
  dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/** Path of the generated distribution directory. */
export const DIST_DIR = joinPath(REPO_DIR, 'packages/constants/dist');

/**
 * Writes content and its declaration to a file.
 *
 * @param {string} baseName Base name of the file, without extension
 * @param {string} content Content
 * @param {string} declContent Declaration content
 */
export const writeContentWithDecl = (baseName, content, declContent) => {
  /**
   * @param {string} name
   * @param {string} data
   */
  const writeData = (name, data) => {
    const filePath = joinPath(DIST_DIR, name);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    writeFile(filePath, data, err => {
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
 * @typedef {Object} PrimitiveInfo Information about a primitive value.
 * @property {string} name Variable name
 * @property {string | number | boolean} value Variable value
 * @property {string=} comment Comment for the variable, if any
 */

/**
 * Writes primitives and their declaration to a file.
 *
 * @param {string} baseName Base name of the file, without extension
 * @param {PrimitiveInfo[]} primitives
 */
export const writePrimitivesWithDecl = (baseName, primitives) => {
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
