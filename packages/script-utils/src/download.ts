import chalk from 'chalk';
import {createWriteStream} from 'fs';
import {get as getHttp, type IncomingMessage, type RequestOptions} from 'http';
import {get as getHttps} from 'https';

import {DownloadError} from './errors';
import {printInfo} from './log';

/**
 * Downloads a file from a URL.
 *
 * @throws {DownloadError}
 */
export const downloadFromUrl = ({
  name,
  url,
  outAbsolutePath,
  options = {},
  redirectHistory = new Set([url]),
}: {
  name: string;
  /** Download URL. */
  url: string;
  /** Absolute file path to which to write the downloaded data. */
  outAbsolutePath: string;
  options?: RequestOptions;
  /** All redirects visited so far. */
  redirectHistory?: Set<string>;
}): Promise<void> =>
  new Promise((resolve, reject) => {
    const pipeFn = (res: IncomingMessage) => {
      res.pipe(createWriteStream(outAbsolutePath));
    };

    const req = url.startsWith('https://')
      ? getHttps(url, options, pipeFn)
      : getHttp(url, options, pipeFn);
    req.on('response', msg => {
      const redirectUrl = msg.headers.location;

      switch (msg.statusCode) {
        case 200: // OK
          break;

        case 301: // Moved Permanently
        case 302: // Found
        case 307: // Temporary Redirect
        case 308: // Permanent Redirect
          if (!redirectUrl) {
            reject(
              new DownloadError(
                name,
                `${msg.statusCode} (${msg.statusMessage})`
              )
            );
            break;
          }
          if (redirectHistory.has(redirectUrl)) {
            reject(
              new DownloadError(
                name,
                `${msg.statusCode} (${msg.statusMessage}) - Redirect loop detected`
              )
            );
            break;
          }
          printInfo(`Redirecting request for ${chalk.bold(name)}...`);
          resolve(
            downloadFromUrl({
              url: redirectUrl,
              outAbsolutePath,
              options,
              name,
              redirectHistory: redirectHistory.add(redirectUrl),
            })
          );
          break;

        default:
          reject(
            new DownloadError(name, `${msg.statusCode} (${msg.statusMessage})`)
          );
          break;
      }
    });
    req.on('close', () => {
      resolve();
    });
    req.on('error', err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
