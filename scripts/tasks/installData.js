import chalk from 'chalk';
import {readFileSync} from 'fs';
import minimist from 'minimist';
import {join as joinPath} from 'path';

import {
  DownloadError,
  downloadFromUrl,
  getAbsolutePath,
  handleError,
  printInfo,
  printUsage,
} from '../utils/index.js';

const DATA_DIR = getAbsolutePath('data');

const DATA_SOURCES_CONFIG_PATH = getAbsolutePath('config/dataSources.json');
const SECRETS_CONFIG_PATH = getAbsolutePath('config/secrets.json');

/**
 * Downloads data specified by data source group IDs.
 *
 * @param {string[]} groupIds Data source group IDs, or all IDs if unspecified
 */
const downloadDataGroups = async groupIds => {
  /** @type {import('../../config/schemas').DataSources} */
  const dataSourcesConfig = JSON.parse(
    readFileSync(DATA_SOURCES_CONFIG_PATH).toString()
  );
  if (groupIds.length) {
    const groupIdSet = new Set(groupIds);
    dataSourcesConfig.groups = dataSourcesConfig.groups.filter(group =>
      groupIdSet.has(group.id)
    );
  }

  /** @type {import('../../config/schemas').Secrets} */
  const secretsConfig = JSON.parse(
    readFileSync(SECRETS_CONFIG_PATH).toString()
  );
  const secrets = new Map(
    secretsConfig.secrets.map(secret => [secret.id, secret.secret])
  );

  for (const group of dataSourcesConfig.groups) {
    printInfo(
      `Fetching data for: ${
        chalk.bold(group.id) +
        (group.description ? ` (${group.description})` : '')
      }...`,
      ...group.sources.map(
        source =>
          `- ${source.id}` +
          (source.description ? ` (${source.description})` : '')
      )
    );
  }

  await Promise.all(
    dataSourcesConfig.groups
      .flatMap(group =>
        group.sources.map(source => ({
          groupId: group.id,
          ...source,
        }))
      )
      .map(source => {
        const unifiedId = `${source.groupId}:${source.id}`;
        if (!source.fileName) {
          throw new DownloadError(
            unifiedId,
            'Filename not provided in data source.'
          );
        }

        let dataUrl = source.url;
        if (dataUrl.includes('${SECRET}')) {
          if (!source.secretId) {
            throw new DownloadError(
              unifiedId,
              'Secret ID not provided in data source URL.'
            );
          }
          const secret = secrets.get(source.secretId);
          if (!secret) {
            throw new DownloadError(
              unifiedId,
              `Secret not found for ID ${source.secretId}.`
            );
          }
          dataUrl = dataUrl.replace('${SECRET}', secret);
        }

        return downloadFromUrl({
          name: unifiedId,
          url: dataUrl,
          outAbsolutePath: joinPath(DATA_DIR, source.fileName),
        });
      })
  );
};

const main = async () => {
  const argv = minimist(process.argv.slice(2));
  if (argv.h || argv.help) {
    printUsage(['installData [data-source-group-ids]...', 'installData'], {
      '-h, --help': 'Display usage information',
    });
    return;
  }

  try {
    await downloadDataGroups(argv._);
  } catch (err) {
    handleError(err);
  }
};

main();
