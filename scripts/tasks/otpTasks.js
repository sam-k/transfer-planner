import {request as gitHubRequest} from '@octokit/request';
import {RequestError as GitHubRequestError} from '@octokit/request-error';
import chalk from 'chalk';
import {existsSync, unlinkSync} from 'fs';
import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {DATA_DIR, OTP_DIR} from '../constants/index.js';
import {
  DownloadError,
  downloadFromUrl,
  printInfo,
  printWarn,
  spawnCmd,
} from '../utils/index.js';

/** Glob path for OpenTripPlanner releases. */
const OTP_JAR_GLOB_PATH = joinPath(OTP_DIR, 'otp-*.jar');
/** Regex for OpenTripPlanner release names. */
const OTP_JAR_REGEX = /otp-(.*)-shaded\.jar$/;
/** Path for OpenTripPlanner street graph. */
const OTP_STREET_GRAPH_PATH = joinPath(DATA_DIR, 'streetGraph.obj');
/** Path for OpenTripPlanner transit graph. */
const OTP_TRANSIT_GRAPH_PATH = joinPath(DATA_DIR, 'graph.obj');

/** Default maximum allocated memory for the JVM for running OpenTripPlanner. */
const DEFAULT_OTP_JVM_MEMORY = 'Xmx8G';

/**
 * Gets paths of all existing OpenTripPlanner releases.
 *
 * @returns {string[]}
 */
const getOtpJarPaths = () => globSync(OTP_JAR_GLOB_PATH).sort();

/**
 * Extracts the OpenTripPlanner release version from its filename.
 *
 * @param {string} filename
 * @returns {string}
 */
const extractOtpVersion = filename => filename.match(OTP_JAR_REGEX)?.[1] ?? '';

/**
 * Downloads the latest OpenTripPlanner release from GitHub, and deletes any
 * existing releases.
 *
 * @returns {Promise<void>}
 */
export const downloadOtp = async () => {
  const jarPaths = getOtpJarPaths();
  if (jarPaths.length) {
    printWarn(
      `Deleting existing OpenTripPlanner release${
        jarPaths.length > 1 ? 's' : ''
      }: ${jarPaths
        .map(jarPath => chalk.bold(extractOtpVersion(jarPath)))
        .sort()
        .join(', ')}...`
    );
    for (const jarPath of jarPaths) {
      unlinkSync(jarPath);
    }
  }

  try {
    const releaseResponse = await gitHubRequest(
      'GET /repos/{owner}/{repo}/releases/latest',
      {
        owner: 'opentripplanner',
        repo: 'OpenTripPlanner',
      }
    );
    const asset = releaseResponse.data.assets.find(asset =>
      OTP_JAR_REGEX.test(asset.name)
    );
    if (!asset) {
      throw new DownloadError(
        'otp',
        'OpenTripPlanner asset not found on GitHub.'
      );
    }

    printInfo(
      `Downloading OpenTripPlanner version: ${chalk.bold(
        extractOtpVersion(asset.name)
      )}...`
    );
    await downloadFromUrl({
      name: 'otp',
      url: asset.browser_download_url,
      outAbsolutePath: joinPath(OTP_DIR, asset.name),
      options: {
        headers: {
          'user-agent': 'transfer-planner',
        },
      },
    });
  } catch (err) {
    if (err instanceof GitHubRequestError) {
      throw new DownloadError(
        'otp',
        `${err.status}${
          err.response?.data &&
          typeof err.response.data === 'object' &&
          'message' in err.response.data
            ? ` (${err.response.data.message})`
            : ''
        } - OpenTripPlanner release not found on GitHub.`
      );
    }
    throw err;
  }
};

/**
 * Builds an OpenTripPlanner transit graph.
 *
 * @param {Object} props
 * @param {boolean=} props.downloadJar Whether to download the latest release
 * @param {boolean=} props.buildStreetGraph Whether to build a new street graph
 * @param {string=} props.jvmMemory Maximum allocated memory for the JVM
 * @returns {Promise<void>}
 */
export const buildOtp = async ({
  downloadJar = false,
  buildStreetGraph = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
}) => {
  let jarPath = getOtpJarPaths()[0];
  if (downloadJar || !jarPath) {
    if (downloadJar) {
      printInfo('Downloading latest OpenTripPlanner release.');
    } else {
      printWarn('OpenTripPlanner release missing.');
    }
    await downloadOtp();
    jarPath = getOtpJarPaths()[0];
  }

  const streetGraphFound = existsSync(OTP_STREET_GRAPH_PATH);
  if (buildStreetGraph || !streetGraphFound) {
    if (buildStreetGraph) {
      if (streetGraphFound) {
        printWarn('Deleting existing OpenTripPlanner street graph...');
        // No need to delete explicitly, as OTP will replace graphs that already
        // exist.
      }
      printInfo('Building new OpenTripPlanner street graph...');
    } else {
      printWarn('OpenTripPlanner street graph missing. Building...');
    }
    await spawnCmd({
      name: 'otp',
      cmd: 'java',
      args: [`-${jvmMemory}`, '-jar', jarPath, '--buildStreet', './data'],
    });
  }

  if (existsSync(OTP_TRANSIT_GRAPH_PATH)) {
    printWarn('Deleting existing OpenTripPlanner transit graph...');
    // No need to delete explicitly, as OTP will replace graphs that already
    // exist.
  }
  printInfo('Building OpenTripPlanner transit graph...');
  await spawnCmd({
    name: 'otp',
    cmd: 'java',
    args: [
      `-${jvmMemory}`,
      '-jar',
      jarPath,
      '--loadStreet',
      '--save',
      './data',
    ],
  });
};

/**
 * Runs an OpenTripPlanner instance.
 *
 * @param {Object} props
 * @param {boolean=} props.downloadJar Whether to download the latest release
 * @param {boolean=} props.buildGraphs Whether to build new street and transit
 * graphs
 * @param {string=} props.jvmMemory Maximum allocated memory for the JVM
 * @returns {Promise<void>}
 */
export const runOtp = async ({
  downloadJar = false,
  buildGraphs = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
}) => {
  const jarPath = getOtpJarPaths()[0];
  if (downloadJar || !jarPath) {
    if (downloadJar) {
      printInfo('Downloading latest OpenTripPlanner release.');
    } else {
      printWarn('OpenTripPlanner release missing.');
    }
    await downloadOtp();
  }

  const transitGraphFound = existsSync(OTP_TRANSIT_GRAPH_PATH);
  if (buildGraphs || !transitGraphFound) {
    if (buildGraphs) {
      printInfo('Building new OpenTripPlanner transit graph.');
    } else {
      printWarn('OpenTripPlanner transit graph missing.');
    }
    await buildOtp({
      buildStreetGraph: true,
      jvmMemory,
    });
  }

  printInfo('Running OpenTripPlanner instance...');
  await spawnCmd({
    name: 'otp',
    cmd: 'java',
    args: [`-${jvmMemory}`, '-jar', jarPath, '--load', './data'],
  });
};
