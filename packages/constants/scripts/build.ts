import {printInfo, printWarn, spawnCmd} from '@internal/script-utils';
import {existsSync, mkdirSync, unlinkSync} from 'fs';
import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {buildDir, buildEnv, buildNetwork} from './tasks';
import {DIST_DIR} from './utils';

/** Prepares a fresh `dist` directory. */
const prepareDistDir = () => {
  const distDirContentPaths = globSync(joinPath(DIST_DIR, '*.{js,ts}'));

  if (!existsSync(DIST_DIR)) {
    printInfo('Creating dist directory...');
    mkdirSync(DIST_DIR);
  } else if (distDirContentPaths.length) {
    printWarn('Deleting contents of existing dist directory...');
    for (const contentPath of distDirContentPaths) {
      unlinkSync(contentPath);
    }
  }
};

const main = async () => {
  prepareDistDir();

  buildDir();
  buildEnv();
  buildNetwork();

  await spawnCmd({
    name: 'constants',
    cmd: 'eslint',
    args: ['--fix', 'dist'],
  }).resolved;
};

main();
