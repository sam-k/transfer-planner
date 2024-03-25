import {REPO_DIR, writePrimitivesWithDecl} from '../utils';

export default () => {
  writePrimitivesWithDecl('dir', [
    {
      name: 'REPO_DIR',
      value: REPO_DIR,
      comment: 'Path of the repository directory.',
    },
  ]);
};
