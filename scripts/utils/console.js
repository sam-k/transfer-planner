import {spawn} from 'child_process';
import minimist from 'minimist';

import {ProcessError} from './errors.js';

/**
 * Gets command-line arguments from the current process.
 *
 * @returns {import('minimist').ParsedArgs}
 */
export const getArgs = () => minimist(process.argv.slice(2));

/**
 * @typedef {Object} SpawnCmdReturn Value returned by `spawnCmd`.
 * @property {string} stdout Collected stdout, if any
 * @property {string} stderr Collected stderr, if any
 */

/**
 * Executes a command in a child process.
 *
 * @param {Object} props
 * @param {string} props.name Name for this process
 * @param {string} props.cmd
 * @param {string[]=} props.args
 * @param {boolean=} props.collectStdout Collects stdout if true, prints to
 * console if false
 * @param {boolean=} props.collectStderr Collects stderr if true, prints to
 * console if false
 * @returns {Promise<SpawnCmdReturn>}
 * @throws {ProcessError}
 */
export const spawnCmd = ({
  name,
  cmd,
  args = [],
  collectStdout = false,
  collectStderr = false,
}) =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => {
      const dataStr = data.toString();
      if (collectStdout) {
        stdout += (stdout ? '\n' : '') + dataStr;
      } else {
        console.log(dataStr);
      }
    });
    proc.stderr.on('data', data => {
      const dataStr = data.toString();
      if (collectStderr) {
        stderr += (stderr ? '\n' : '') + dataStr;
      } else {
        console.error(dataStr);
      }
    });

    proc.on('close', code => {
      if (code !== 0 && code !== null) {
        reject(new ProcessError(name, code, proc.spawnargs));
        return;
      }
      resolve({stdout, stderr});
    });
    proc.on('error', err => {
      if (err) {
        reject(err);
        return;
      }
      resolve({stdout, stderr});
    });
  });
