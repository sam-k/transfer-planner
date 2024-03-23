import {existsSync, unlinkSync} from 'fs';
import {join as joinPath} from 'path';

import buildDir from './tasks/buildDir.js';
import buildEnv from './tasks/buildEnv.js';
import buildNetwork from './tasks/buildNetwork.js';
import {DIST_DIR} from './utils.js';

const main = () => {
  const indexPath = joinPath(DIST_DIR, 'index.js');
  if (existsSync(indexPath)) {
    unlinkSync(indexPath);
  }
  const declIndexPath = joinPath(DIST_DIR, 'index.d.ts');
  if (existsSync(declIndexPath)) {
    unlinkSync(declIndexPath);
  }

  buildDir();
  buildEnv();
  buildNetwork();
};

main();
