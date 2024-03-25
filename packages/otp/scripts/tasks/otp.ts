import {
  DownloadError,
  downloadFromUrl,
  printInfo,
  printWarn,
  spawnCmd,
} from '@internal/script-utils';
import {request as gitHubRequest} from '@octokit/request';
import {RequestError as GitHubRequestError} from '@octokit/request-error';
import {existsSync, mkdirSync, unlinkSync} from 'fs';
import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {BIN_DIR, DATA_DIR} from '../utils';

/** Glob path for OpenTripPlanner releases. */
const OTP_JAR_GLOB_PATH = joinPath(BIN_DIR, 'otp-*.jar');
/** Regex for OpenTripPlanner release names. */
const OTP_JAR_REGEX = /otp-(.*)-shaded\.jar$/;
/** Path for OpenTripPlanner street graph. */
const OTP_STREET_GRAPH_PATH = joinPath(DATA_DIR, 'streetGraph.obj');
/** Path for OpenTripPlanner transit graph. */
const OTP_TRANSIT_GRAPH_PATH = joinPath(DATA_DIR, 'graph.obj');

/** Default maximum allocated memory for the JVM for running OpenTripPlanner. */
const DEFAULT_OTP_JVM_MEMORY = 'Xmx8G';

/** Gets paths of all existing OpenTripPlanner releases. */
const getOtpJarPaths = () => globSync(OTP_JAR_GLOB_PATH).sort();

/** Extracts the OpenTripPlanner release version from its filename. */
const extractOtpVersion = (filename: string) =>
  filename.match(OTP_JAR_REGEX)?.[1] ?? '';

/**
 * Downloads the latest OpenTripPlanner release from GitHub, and deletes any
 * existing releases.
 */
export const downloadOtp = async () => {
  if (!existsSync(BIN_DIR)) {
    printInfo('Creating bin directory...');
    mkdirSync(BIN_DIR);
  }

  const jarPaths = getOtpJarPaths();
  if (jarPaths.length) {
    printWarn(
      `Deleting existing OpenTripPlanner release${
        jarPaths.length > 1 ? 's' : ''
      }: ${jarPaths
        .map(jarPath => extractOtpVersion(jarPath))
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
      `Downloading OpenTripPlanner version: ${extractOtpVersion(asset.name)}...`
    );
    await downloadFromUrl({
      name: 'otp',
      url: asset.browser_download_url,
      outAbsolutePath: joinPath(BIN_DIR, asset.name),
      options: {
        headers: {
          'user-agent': 'transfer-planner',
        },
      },
    });
  } catch (err) {
    if (!(err instanceof GitHubRequestError)) {
      throw err;
    }
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
};

/** Builds an OpenTripPlanner transit graph. */
export const buildOtp = async ({
  downloadJar = false,
  buildStreetGraph = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
}: {
  /** Whether to download the latest release. */
  downloadJar?: boolean;
  /** Whether to build a new street graph. */
  buildStreetGraph?: boolean;
  /** Maximum allocated memory for the JVM. */
  jvmMemory?: string;
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

/** Runs an OpenTripPlanner instance. */
export const runOtp = async ({
  downloadJar = false,
  buildGraphs = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
}: {
  /** Whether to download the latest release. */
  downloadJar?: boolean;
  /** Whether to build new street and transit graphs. */
  buildGraphs?: boolean;
  /** Maximum allocated memory for the JVM. */
  jvmMemory?: string;
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
