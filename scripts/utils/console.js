import {spawn} from 'child_process';

import {ProcessError} from './errors.js';

/**
 * @typedef {Object} SpawnCmdReturn
 * @property {string} stdout
 * @property {string} stderr
 */

/**
 * Executes a command in a child process.
 *
 * @param {Object} props
 * @param {string} props.name Name for this process
 * @param {string} props.cmd
 * @param {string[]=} props.args
 * @param {boolean=} props.collectStdout
 * @param {boolean=} props.collectStderr
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
        stdout += dataStr + '\n';
      } else {
        console.log(dataStr);
      }
    });
    proc.stderr.on('data', data => {
      const dataStr = data.toString();
      if (collectStderr) {
        stderr += dataStr + '\n';
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
