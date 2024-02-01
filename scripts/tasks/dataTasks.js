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

/** Regex for matching secrets within data source URLs. */
const SECRET_REGEX = /\${(.+)}/;

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
        const [match, secretId] = dataUrl.match(SECRET_REGEX) ?? [];
        if (match) {
          const secret = process.env[secretId];
          if (!secret) {
            throw new DownloadError(
              unifiedId,
              `Secret ${chalk.bold(secretId)} not found.`
            );
          }
          dataUrl = dataUrl.replace(`\${${secretId}}`, secret);
        }

        return downloadFromUrl({
          name: unifiedId,
          url: dataUrl,
          outAbsolutePath: joinPath(DATA_DIR, source.fileName),
        });
      })
  );
};
