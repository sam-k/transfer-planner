import {
  DownloadError,
  downloadFromUrl,
  printInfo,
  printWarn,
  spawnCmd,
} from '@internal/script-utils';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
} from 'fs';
import {join as joinPath} from 'path';

import type {DataSources} from '../../config/schemas/dataSources.schema';
import {CONFIG_DIR, DATA_DIR} from '../utils';
import {sanitizeCsvInSource} from './sanitize';

/** Path of the config specifying all data sources. */
const DATA_SOURCES_CONFIG_PATH = joinPath(CONFIG_DIR, 'dataSources.json');

/** Gets the full name of a data source. */
const getDataName = (id: string, description?: string) =>
  id + (description ? ` (${description})` : '');

/** Zips and replaces the given directory. */
const zipAndReplace = async (dirPath: string) => {
  const tmpZipPath = `${dirPath}-${Date.now()}`;
  await spawnCmd({
    name: 'data',
    cmd: 'zip',
    args: ['-j', '-r', '-q', tmpZipPath, dirPath],
  }).resolved;
  rmSync(dirPath, {recursive: true});
  renameSync(tmpZipPath, dirPath);
};

/** Unzips and replaces the given archive. */
const unzipAndReplace = async (zipPath: string) => {
  const tmpDirPath = `${zipPath}-${Date.now()}`;
  await spawnCmd({
    name: 'data',
    cmd: 'unzip',
    args: ['-q', zipPath, '-d', tmpDirPath],
  }).resolved;
  unlinkSync(zipPath);
  renameSync(tmpDirPath, zipPath);
};

/**
 * Downloads data specified by geographical region IDs.
 *
 * @param regionIds Region IDs, or all such IDs if unspecified
 */
export const downloadDataForRegions = async (regionIds: string[]) => {
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
      .map(async source => {
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

        const outPath = joinPath(DATA_DIR, source.fileName);

        await downloadFromUrl({
          name: unifiedId,
          url: dataUrl,
          outAbsolutePath: outPath,
        });

        if (!source.sanitizeRules?.length) {
          return;
        }
        await unzipAndReplace(outPath);
        // We block on each promise here instead of awaiting them all in
        // parallel, so the file manipulations do not race with each other.
        for (const rule of source.sanitizeRules ?? []) {
          await sanitizeCsvInSource(joinPath(DATA_DIR, source.fileName), rule);
        }
        await zipAndReplace(outPath);
      })
  );
};
