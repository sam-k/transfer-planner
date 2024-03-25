import {existsSync, readFileSync} from 'fs';
import {camelCase} from 'lodash-es';
import {join as joinPath} from 'path';

import {REPO_DIR, writeContentWithDecl} from '../utils';

export default () => {
  const dotEnvPath = joinPath(REPO_DIR, '.env');
  if (!existsSync(dotEnvPath)) {
    return;
  }

  const envNamesJson = JSON.stringify(
    (readFileSync(dotEnvPath, 'utf-8').match(/^.+?(?==)/gm) ?? []).reduce(
      (acc, curr) => ({
        ...acc,
        [camelCase(curr)]: curr,
      }),
      /* initialValue= */ {}
    )
  );

  writeContentWithDecl(
    'env',
    `export const ENV_VARS = ${envNamesJson};\n`,
    `/** Names of environment variables used by this application. */
export const ENV_VARS: ${envNamesJson};\n`
  );
};
