import {join as joinPath} from 'path';

/**
 * Gets an absolute path from the given path fragments relative to the
 * repository.
 */
export const getAbsolutePath = ({
  paths,
  parentPath,
}: {
  paths: string[];
  parentPath?: string;
}) =>
  paths[0]?.startsWith('/') || !parentPath
    ? joinPath(...paths) // Already an absolute path
    : joinPath(parentPath, ...paths);

/** Gets a path as relative to the given path. */
export const getRelativePath = ({
  path,
  parentPath,
}: {
  path: string;
  parentPath: string;
}) => path.replace(parentPath, '').replace(/^\//, '');
