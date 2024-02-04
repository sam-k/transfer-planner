import chalk from 'chalk';
import {configDotenv} from 'dotenv';
import express, {type Request} from 'express';
import minimist from 'minimist';
import {join as joinPath} from 'path';

import {fetchWithQuery, type FetchWithQuery} from './api';
import {REPO_DIR} from './utils';

configDotenv({path: joinPath(REPO_DIR, '.env')});

const args = minimist(process.argv.slice(2));
const PORT = parseInt(args.port, /* radix= */ 10) || 3000;

const app = express();

app.get(
  '/fetch',
  async (req: Request<unknown, unknown, unknown, FetchWithQuery>, res) => {
    try {
      const {encodedUrl, ...queryParams} = req.query;
      const {body, headers} = await fetchWithQuery(encodedUrl, queryParams);
      if (!body) {
        throw new Error('Body was empty.');
      }
      await body.pipeTo(
        new WritableStream({
          start: () => {
            headers.forEach((val, name) => {
              res.setHeader(name, val);
            });
          },
          write: chunk => {
            res.write(chunk);
          },
          close: () => {
            res.end();
          },
        })
      );
    } catch (err) {
      process.stderr.write(`${err}\n`);
      res.status(500).send(err);
    }
  }
);

app.listen(PORT, () => {
  process.stdout.write(`Starting server on port ${chalk.bold(PORT)}...\n`);
});
