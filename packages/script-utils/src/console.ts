import {spawn} from 'child_process';
import minimist from 'minimist';

import {ProcessError} from './errors';

/** Gets command-line arguments from the current process. */
export const getArgs = () => minimist(process.argv.slice(2));

/**
 * Executes a command in a child process.
 *
 * @throws {ProcessError}
 */
export const spawnCmd = ({
  name,
  cmd,
  args = [],
  collectStdout = false,
  collectStderr = false,
}: {
  name: string;
  cmd: string;
  args: string[];
  /** Collects stdout if true; prints to console if false. */
  collectStdout: boolean;
  /** Collects stderr if true; prints to console if false. */
  collectStderr: boolean;
}): Promise<{stdout: string; stderr: string}> =>
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
