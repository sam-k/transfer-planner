import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {spawnCmd} from './console';
import {printInfo, printWarn} from './log';
import {getRelativePath} from './path';

/** Lints all files in a directory. */
export const lintFilesInDir = async ({
  dirPath,
  pkgDirPath,
  exts,
}: {
  /** Directory whose files to lint. */
  dirPath: string;
  /** Directory of the applicable package. */
  pkgDirPath: string;
  /** Extensions to target for linting. */
  exts?: string[];
}) => {
  const dirRelativePath = getRelativePath({
    path: dirPath,
    parentPath: pkgDirPath,
  });
  const dirContentPaths = globSync(
    joinPath(dirPath, '**/*' + (exts ? `.${exts.join(',')}` : ''))
  );

  const numFiles = dirContentPaths.length;
  if (numFiles) {
    printInfo(
      `Linting ${numFiles} file${numFiles > 1 ? 's' : ''}...`,
      ...dirContentPaths.map(
        filePath =>
          `- ${getRelativePath({path: filePath, parentPath: pkgDirPath})}`
      )
    );
  } else {
    printWarn(`No files to lint in ${dirRelativePath}.`);
  }

  await spawnCmd({
    name: 'script-utils',
    cmd: 'eslint',
    args: ['--quiet', '--no-ignore', '--fix', ...dirContentPaths],
  }).resolved;
};
