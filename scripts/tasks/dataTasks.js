import chalk from 'chalk';
import {existsSync, readFileSync} from 'fs';
import {join as joinPath} from 'path';

import {CONFIG_DIR, DATA_DIR} from '../constants/index.js';
import {
  DownloadError,
  downloadFromUrl,
  printInfo,
  printWarn,
} from '../utils/index.js';

/** Path of the config specifying all data sources. */
const DATA_SOURCES_CONFIG_PATH = joinPath(CONFIG_DIR, 'dataSources.json');
/** Path of the config specifying any secrets used in fetching data sources. */
const SECRETS_CONFIG_PATH = joinPath(CONFIG_DIR, 'secrets.json');

/**
 * Gets the full name of a data source.
 *
 * @param {string} id
 * @param {string=} description
 */
const getDataName = (id, description) =>
  id + (description ? ` (${description})` : '');

/**
 * Downloads data specified by data source group IDs.
 *
 * @param {string[]} groupIds Data source group IDs, or all IDs if unspecified
 */
export const downloadDataGroups = async groupIds => {
  /** @type {import('../../config/schemas/index.js').DataSources} */
  const dataSourcesConfig = JSON.parse(
    readFileSync(DATA_SOURCES_CONFIG_PATH).toString()
  );
  if (groupIds.length) {
    const groupIdSet = new Set(groupIds);
    dataSourcesConfig.groups = dataSourcesConfig.groups.filter(group =>
      groupIdSet.has(group.id)
    );
  }

  /** @type {import('../../config/schemas/index.js').Secrets} */
  const secretsConfig = JSON.parse(
    readFileSync(SECRETS_CONFIG_PATH).toString()
  );
  const secrets = new Map(
    secretsConfig.secrets.map(secret => [secret.id, secret.secret])
  );

  for (const group of dataSourcesConfig.groups) {
    const existingSources = group.sources.filter(
      source =>
        source.fileName && existsSync(joinPath(DATA_DIR, source.fileName))
    );
    if (existingSources.length) {
      printWarn(
        `Replacing existing data for: ${getDataName(
          chalk.bold(group.id),
          group.description
        )}...`,
        ...existingSources.map(
          source => `- ${getDataName(source.id, source.description)}`
        )
      );
    }
  }
  for (const group of dataSourcesConfig.groups) {
    printInfo(
      `Fetching data for: ${getDataName(
        chalk.bold(group.id),
        group.description
      )}...`,
      ...group.sources.map(
        source => `- ${getDataName(source.id, source.description)}`
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
