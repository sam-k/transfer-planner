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
 * Downloads data specified by geographical region IDs.
 *
 * @param {string[]} regionIds Region IDs, or all such IDs if unspecified
 */
export const downloadDataForRegions = async regionIds => {
  /** @type {import('../../config/schemas/index.js').DataSources} */
  const dataSourcesConfig = JSON.parse(
    readFileSync(DATA_SOURCES_CONFIG_PATH).toString()
  );
  if (regionIds.length) {
    const regionIdSet = new Set(regionIds);
    dataSourcesConfig.regions = dataSourcesConfig.regions.filter(region =>
      regionIdSet.has(region.id)
    );
  }

  /** @type {import('../../config/schemas/index.js').Secrets} */
  const secretsConfig = JSON.parse(
    readFileSync(SECRETS_CONFIG_PATH).toString()
  );
  const secrets = new Map(
    secretsConfig.secrets.map(secret => [secret.id, secret.secret])
  );

  for (const region of dataSourcesConfig.regions) {
    const existingSources = region.sources.filter(
      source =>
        source.fileName && existsSync(joinPath(DATA_DIR, source.fileName))
    );
    if (existingSources.length) {
      printWarn(
        `Deleting existing data for: ${getDataName(
          chalk.bold(region.id),
          region.description
        )}...`,
        ...existingSources.map(
          source => `- ${getDataName(source.id, source.description)}`
        )
      );
    }
  }
  for (const region of dataSourcesConfig.regions) {
    printInfo(
      `Fetching data for: ${getDataName(
        chalk.bold(region.id),
        region.description
      )}...`,
      ...region.sources.map(
        source => `- ${getDataName(source.id, source.description)}`
      )
    );
  }

  await Promise.all(
    dataSourcesConfig.regions
      .flatMap(region =>
        region.sources.map(source => ({
          regionId: region.id,
          ...source,
        }))
      )
      .map(source => {
        const unifiedId = `${source.regionId}:${source.id}`;
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
