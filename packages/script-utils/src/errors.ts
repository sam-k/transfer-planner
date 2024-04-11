import chalk from 'chalk';

import {printError} from './log';
import {getRelativePath} from './path';

/** Any custom error supported by this application. */
class SupportedError {
  /** Name for the task throwing this error. */
  name: string;
  /** Reason for the error. */
  reason: string;

  constructor(name: string, reason: string) {
    if (new.target === SupportedError) {
      throw new TypeError('Cannot instantiate base class SupportedError.');
    }
    this.name = name;
    this.reason = reason;
  }

  toString(prefix?: string) {
    return prefix ? `${prefix}: ${this.reason}` : this.reason;
  }
}

/** Error thrown by any process. */
export class ProcessError extends SupportedError {
  /** Exit code from this process. */
  code: number;
  /** Arguments used to execute this command. */
  args: string[] = [];

  constructor(name: string, code: number, args: string[], stderr: string) {
    super(name, stderr);
    this.code = code;
    this.args = args;
  }

  toString() {
    const escapeRegex = /[\t\n\r "#$%&'()*;<=>?\\[`|~]/;

    return super.toString(
      `Process for ${chalk.bold(this.name)} failed with exit code ${
        this.code
      }, while running command ${this.args
        .map(arg =>
          escapeRegex.test(arg) ? `'${arg.replaceAll("'", "\\'")}'` : arg
        )
        .join(' ')}`
    );
  }
}

/** Error thrown by any download request. */
export class DownloadError extends SupportedError {
  constructor(name: string, reason: string) {
    super(name, reason);
  }

  toString() {
    return super.toString(`Download failed for ${chalk.bold(this.name)}`);
  }
}

/** Error thrown when an expected path is not found. */
export class PathNotFoundError extends SupportedError {
  constructor(path: string, parentPath?: string) {
    super(
      /* name= */ '',
      parentPath ? getRelativePath({path, parentPath}) : path
    );
  }

  toString() {
    return super.toString('Path not found');
  }
}

/** Error thrown by any task. */
export class DefaultError extends SupportedError {
  constructor(reason: string) {
    super(/* name= */ '', reason);
  }

  toString() {
    return super.toString();
  }
}

/** Handles any error supported by this application, then exits. */
export const handleError = (err: unknown) => {
  if (err instanceof SupportedError) {
    printError(err.toString());
    process.exit(1);
  }
  throw err;
};
