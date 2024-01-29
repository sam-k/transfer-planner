import chalk from 'chalk';

import {printError} from './log.js';

/** Any custom error supported by this application. */
class SupportedError {
  /**
   * @param {string} name Name for the task throwing this error
   * @param {string} reason Reason for the error
   */
  constructor(name, reason) {
    if (new.target === SupportedError) {
      throw new TypeError('Cannot instantiate base class SupportedError.');
    }
    this.name = name;
    this.reason = reason;
  }

  /**
   * @param {string=} prefix
   * @returns {string}
   */
  toString(prefix) {
    return prefix ? `${prefix}: ${this.reason}` : this.reason;
  }
}

/** Error thrown by any process. */
export class ProcessError extends SupportedError {
  /**
   * @param {string} name Name for this process
   * @param {number} code Exit code from this process
   * @param {string[]} args Arguments used to execute this command
   */
  constructor(name, code, args) {
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

  /** @returns {string} */
  toString() {
    return super.toString(
      `Process for ${chalk.bold(this.name)} failed with exit code ${this.code}`
    );
  }
}

/** Error thrown by any download request. */
export class DownloadError extends SupportedError {
  /**
   * @param {string} name Name for this request
   * @param {string} reason Reason for the error
   */
  constructor(name, reason) {
    super(name, reason);
  }

  /** @returns {string} */
  toString() {
    return super.toString(`Download failed for ${chalk.bold(this.name)}`);
  }
}

/**
 * Handles any error supported by this application, then exits.
 *
 * @param {unknown} err
 */
export const handleError = err => {
  if (err instanceof SupportedError) {
    printError(err.toString());
    process.exit(1);
  }
  throw err;
};
