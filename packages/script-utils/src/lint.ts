import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {spawnCmd} from './console';
import {printInfo, printWarn} from './log';
import {getRelativePath} from './path';

/** Lints all files in a directory. */
export const lintFilesInDir = async ({
  dirName,
  pkgDir,
  exts,
}: {
  /** Name of the directory whose files to lint, relative to `pkgDir`. */
  dirName: string;
  /** Directory of the applicable package. */
  pkgDir: string;
  /** Extensions to target for linting. */
  exts?: string[];
}) => {
  const dirContentPaths = globSync(
    joinPath(pkgDir, dirName, '**/*' + (exts ? `.${exts.join(',')}` : ''))
  );

  const numFiles = dirContentPaths.length;
  if (numFiles) {
    printInfo(
      `Linting ${numFiles} file${numFiles > 1 ? 's' : ''}...`,
      ...dirContentPaths.map(
        filePath => `- ${getRelativePath({path: filePath, parentPath: pkgDir})}`
      )
    );
  } else {
    printWarn('No files to lint.');
  }

  await spawnCmd({
    name: 'script-utils',
    cmd: 'eslint',
    args: ['--quiet', '--no-ignore', '--fix', ...dirContentPaths],
  }).resolved;
};
