import chalk from 'chalk';
import {createWriteStream, readFileSync} from 'fs';
import {get as getHttp} from 'http';
import {get as getHttps} from 'https';
import minimist from 'minimist';

import {printUsage} from '../utils.js';

const DATA_SOURCES_CONFIG_PATH = 'config/dataSources.json';
const SECRETS_CONFIG_PATH = 'config/secrets.json';

/**
 * Downloads data from a URL.
 *
 * @param {string} url Download URL
 * @param {string} outPath File path to write the downloaded data
 * @returns {Promise<void>}
 */
const downloadData = (url, outPath) =>
  new Promise((resolve, reject) => {
    const pipeFn = (/** @type {import('http').IncomingMessage} */ res) => {
      res.pipe(createWriteStream(outPath));
    };

    const req = url.startsWith('https://')
      ? getHttps(url, pipeFn)
      : getHttp(url, pipeFn);
    req.on('error', err => {
      reject(err);
    });
    resolve();
  });

const main = async () => {
  const argv = minimist(process.argv.slice(2));
  if (argv.h || argv.help) {
    printUsage(['installData [data-source-group-ids]...', 'installData'], {
      '-h, --help': 'Display usage information',
    });
    return;
  }
  const dataSourceGroupIds = new Set(argv._);

  /** @type {import('../../config/schemas').DataSources} */
  const dataSourcesConfig = JSON.parse(
    readFileSync(DATA_SOURCES_CONFIG_PATH).toString()
  );
  if (dataSourceGroupIds.size) {
    dataSourcesConfig.groups = dataSourcesConfig.groups.filter(group =>
      dataSourceGroupIds.has(group.id)
    );
  }

  /** @type {import('../../config/schemas').Secrets} */
  const secretsConfig = JSON.parse(
    readFileSync(SECRETS_CONFIG_PATH).toString()
  );
  const secrets = new Map(
    secretsConfig.secrets.map(secret => [secret.id, secret.secret])
  );

  for (const group of dataSourcesConfig.groups ?? []) {
    console.log(
      `Fetching data for: ${chalk.magenta(
        chalk.bold(group.id) +
          (group.description ? ` (${group.description})` : '')
      )}...`
    );
  }

  await Promise.all(
    dataSourcesConfig.groups
      ?.flatMap(group => group.sources)
      .map(source => {
        if (!source.fileName) {
          throw `Filename for ${source.id} not provided.`;
        }
        return downloadData(
          source.url.replace(
            '${SECRET}',
            secrets.get(source.secretId ?? '') ?? ''
          ),
          source.fileName
        );
      }) ?? []
  );
};

main();
