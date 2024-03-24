import {existsSync, mkdirSync, unlinkSync} from 'fs';
import {join as joinPath} from 'path';

import {buildDir, buildEnv, buildNetwork} from './tasks';
import {DIST_DIR} from './utils';

const main = () => {
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR);
  }

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
