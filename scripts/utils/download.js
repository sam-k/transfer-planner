import chalk from 'chalk';
import {createWriteStream} from 'fs';
import {get as getHttp} from 'http';
import {get as getHttps} from 'https';

import {DownloadError} from './errors.js';
import {printInfo} from './log.js';

/**
 * Downloads a file from a URL.
 *
 * @param {Object} props
 * @param {string} props.name Name for this request
 * @param {string} props.url Download URL
 * @param {string} props.outAbsolutePath Absolute file path to which to write
 * the downloaded data
 * @param {import('http').RequestOptions=} props.options
 * @param {Set<string>=} props.redirectHistory All redirects visited so far
 * @returns {Promise<void>}
 * @throws {DownloadError}
 */
export const downloadFromUrl = ({
  name,
  url,
  outAbsolutePath,
  options = {},
  redirectHistory = new Set([url]),
}) =>
  new Promise((resolve, reject) => {
    const pipeFn = (/** @type {import('http').IncomingMessage} */ res) => {
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
