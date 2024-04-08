import {
  API_FETCH_ENDPOINT_NAME,
  API_PORT,
  API_TZ_ENDPOINT_NAME,
  REPO_DIR,
} from '@internal/constants';
import chalk from 'chalk';
import cors from 'cors';
import {configDotenv} from 'dotenv';
import express, {type Request} from 'express';
import minimist from 'minimist';
import {join as joinPath} from 'path';

import {fetchWithQuery, type FetchWithQueryParams} from './fetch';
import {fetchTimezones, type FetchTimezonesParams} from './tz';

configDotenv({path: joinPath(REPO_DIR, '.env')});

const args = minimist(process.argv.slice(2));
const port = parseInt(args.port, /* radix= */ 10) || API_PORT;

const app = express();
app.use(cors());

// Endpoint for fetching data with query params and environment variables.
app.get(
  `/${API_FETCH_ENDPOINT_NAME}`,
  async (
    req: Request<unknown, unknown, unknown, FetchWithQueryParams>,
    res
  ) => {
    try {
      const {encodedUrl, encodedOptions, ...encodedQueryParams} = req.query;
      const {body} = await fetchWithQuery({
        encodedUrl,
        encodedOptions,
        encodedQueryParams,
      });
      if (!body) {
        throw new Error('Body was empty.');
      }
      await body.pipeTo(
        new WritableStream({
          write: chunk => {
            res.write(chunk);
          },
          close: () => {
            res.end();
          },
        })
      );
    } catch (err) {
      process.stderr.write(chalk.red(chalk.bold('ERROR:'), `${err}\n`));
      res.status(500).send(err);
    }
  }
);

// Endpoint for fetching timezones corresponding to the given coordinates.
app.get(
  `/${API_TZ_ENDPOINT_NAME}`,
  (req: Request<unknown, unknown, unknown, FetchTimezonesParams>, res) => {
    res.status(200).send({
      timezones: fetchTimezones(req.query),
    });
  }
);

app.listen(port, () => {
  process.stdout.write(`Starting server on port ${chalk.bold(port)}...\n`);
});
