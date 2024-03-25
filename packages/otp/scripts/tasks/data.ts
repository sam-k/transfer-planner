import {
  DownloadError,
  downloadFromUrl,
  printInfo,
  printWarn,
} from '@internal/script-utils';
import {existsSync, mkdirSync, readFileSync} from 'fs';
import {join as joinPath} from 'path';

import type {DataSources} from '../../config/schemas/dataSources.schema';
import {CONFIG_DIR, DATA_DIR, configureDotEnv} from '../utils';

/** Path of the config specifying all data sources. */
const DATA_SOURCES_CONFIG_PATH = joinPath(CONFIG_DIR, 'dataSources.json');

/** Gets the full name of a data source. */
const getDataName = (id: string, description?: string) =>
  id + (description ? ` (${description})` : '');

/**
 * Downloads data specified by geographical region IDs.
 *
 * @param regionIds Region IDs, or all such IDs if unspecified
 */
export const downloadDataForRegions = async (regionIds: string[]) => {
  configureDotEnv();

  const dataSourcesConfig: DataSources = JSON.parse(
    readFileSync(DATA_SOURCES_CONFIG_PATH).toString()
  );
  if (regionIds.length) {
    const regionIdSet = new Set(regionIds);
    dataSourcesConfig.regions = dataSourcesConfig.regions.filter(region =>
      regionIdSet.has(region.id)
    );
  }

  if (!existsSync(DATA_DIR)) {
    printInfo('Creating data directory...');
    mkdirSync(DATA_DIR);
  } else {
    for (const region of dataSourcesConfig.regions) {
      const existingSources = region.sources.filter(
        source =>
          source.fileName && existsSync(joinPath(DATA_DIR, source.fileName))
      );
      if (existingSources.length) {
        printWarn(
          `Deleting existing data for: ${getDataName(
            region.id,
            region.description
          )}...`,
          ...existingSources.map(
            source => `- ${getDataName(source.id, source.description)}`
          )
        );
      }
    }
  }
  for (const region of dataSourcesConfig.regions) {
    printInfo(
      `Fetching data for: ${getDataName(region.id, region.description)}...`,
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
        const [match, secretId] = dataUrl.match(/\${(.+)}/) ?? [];
        if (match) {
          const secret = process.env[secretId];
          if (!secret) {
            throw new DownloadError(unifiedId, `Secret ${secretId} not found.`);
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
