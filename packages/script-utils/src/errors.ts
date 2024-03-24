import chalk from 'chalk';

import {printError} from './log';

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

  constructor(name: string, code: number, args: string[]) {
    const escapeRegex = /[\t\n\r "#$%&'()*;<=>?\\[`|~]/;
    super(
      name,
      /* reason= */ args
        .map(arg =>
          escapeRegex.test(arg) ? `'${arg.replaceAll("'", "\\'")}'` : arg
        )
        .join(' ')
    );
    this.code = code;
  }

  toString() {
    return super.toString(
      `Process for ${chalk.bold(this.name)} failed with exit code ${this.code}`
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

/** Handles any error supported by this application, then exits. */
export const handleError = (err: unknown) => {
  if (err instanceof SupportedError) {
    printError(err.toString());
    process.exit(1);
  }
  throw err;
};
