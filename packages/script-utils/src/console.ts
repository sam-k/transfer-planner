import {spawn, type ChildProcess, type SpawnOptions} from 'child_process';
import minimist from 'minimist';

import {ProcessError} from './errors';

/** Gets command-line arguments from the current process. */
export const getArgs = () => minimist(process.argv.slice(2));

/** Executes a command in a child process. */
export const spawnCmd = ({
  name,
  cmd,
  args = [],
  options = {},
  silent = false,
}: {
  name: string;
  cmd: string;
  args?: string[];
  options?: SpawnOptions;
  /** Whether to suppress stdout/stderr output. */
  silent?: boolean;
}): {proc: ChildProcess; resolved: Promise<void>} => {
  const proc = spawn(cmd, args, options);

  return {
    proc,
    resolved: new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', data => {
        stdout += data.toString();
        if (!silent) {
          console.log(data.toString());
        }
      });
      proc.stderr?.on('data', data => {
        stderr += data.toString();
        if (!silent) {
          console.error(data.toString());
        }
      });

      proc.on('close', code => {
        switch (code) {
          case 0: // Success
          case 130: // SIGINT
          case 143: // SIGTERM
          case null:
            resolve();
            return;
          default:
            reject(
              new ProcessError(name, code, proc.spawnargs, stderr || stdout)
            );
            return;
        }
      });
      proc.on('error', err => {
        if (!err) {
          resolve();
          return;
        }
        reject(err);
      });
    }),
  };
};
