import {OTP_PORT} from '@internal/constants';
import {
  DefaultError,
  DownloadError,
  downloadFromUrl,
  getRelativePath,
  handleError,
  isPortBusy,
  lintFilesInDir,
  printInfo,
  printWarn,
  spawnCmd,
} from '@internal/script-utils';
import {request as gitHubRequest} from '@octokit/request';
import {RequestError as GitHubRequestError} from '@octokit/request-error';
import {existsSync, mkdirSync, unlinkSync} from 'fs';
import {globSync} from 'glob';
import {join as joinPath} from 'path';

import {BIN_DIR, DATA_DIR, DIST_DIR, EMPTY_DATA_DIR, PKG_DIR} from '../utils';

/** Glob path for OpenTripPlanner releases. */
const OTP_JAR_GLOB_PATH = joinPath(BIN_DIR, 'otp-*.jar');
/** Regex for OpenTripPlanner release names. */
const OTP_JAR_REGEX = /otp-(.*)-shaded\.jar$/;
/** Path for OpenTripPlanner street graph. */
const OTP_STREET_GRAPH_FILENAME = 'streetGraph.obj';
/** Path for OpenTripPlanner transit graph. */
const OTP_TRANSIT_GRAPH_FILENAME = 'graph.obj';

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
  dataDir = DATA_DIR,
  downloadJar = false,
  buildStreetGraph = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
  silent = false,
}: {
  /** Directory for data and transit graphs. */
  dataDir?: string;
  /** Whether to download the latest release. */
  downloadJar?: boolean;
  /** Whether to build a new street graph. */
  buildStreetGraph?: boolean;
  /** Maximum allocated memory for the JVM. */
  jvmMemory?: string;
  /** Whether to suppress console output. */
  silent?: boolean;
}) => {
  const dataDirRelativePath = getRelativePath({
    path: dataDir,
    parentPath: PKG_DIR,
  });

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

  const streetGraphFound = existsSync(
    joinPath(dataDir, OTP_STREET_GRAPH_FILENAME)
  );
  if (buildStreetGraph || !streetGraphFound) {
    if (buildStreetGraph) {
      if (streetGraphFound) {
        printWarn(
          `Deleting existing OpenTripPlanner street graph in ${dataDirRelativePath}...`
        );
        // No need to delete explicitly, as OTP will replace graphs that already
        // exist.
      }
      printInfo(
        `Building new OpenTripPlanner street graph in ${dataDirRelativePath}...`
      );
    } else {
      printWarn(
        `OpenTripPlanner street graph missing in ${dataDirRelativePath}. Building...`
      );
    }
    await spawnCmd({
      name: 'otp',
      cmd: 'java',
      args: [`-${jvmMemory}`, '-jar', jarPath, '--buildStreet', dataDir],
      silent,
    }).resolved;
  }

  if (existsSync(joinPath(dataDir, OTP_TRANSIT_GRAPH_FILENAME))) {
    printWarn(
      `Deleting existing OpenTripPlanner transit graph in ${dataDirRelativePath}...`
    );
    // No need to delete explicitly, as OTP will replace graphs that already
    // exist.
  }
  printInfo(
    `Building OpenTripPlanner transit graph in ${dataDirRelativePath}...`
  );
  await spawnCmd({
    name: 'otp',
    cmd: 'java',
    args: [`-${jvmMemory}`, '-jar', jarPath, '--loadStreet', '--save', dataDir],
    silent,
  }).resolved;
};

/**
 * Runs an OpenTripPlanner instance.
 *
 * Instead of waiting for the process to resolve, this returns the spawned child
 * process and a promise for its completion status. In a successful server
 * startup, the process will hang indefinitely.
 */
export const runOtp = async ({
  dataDir = DATA_DIR,
  downloadJar = false,
  buildGraphs = false,
  jvmMemory = DEFAULT_OTP_JVM_MEMORY,
  port = OTP_PORT,
  silent = false,
}: {
  /** Directory for data and transit graphs. */
  dataDir?: string;
  /** Whether to download the latest release. */
  downloadJar?: boolean;
  /** Whether to build new street and transit graphs. */
  buildGraphs?: boolean;
  /** Maximum allocated memory for the JVM. */
  jvmMemory?: string;
  /** Port for the server. */
  port?: number;
  /** Whether to suppress console output. */
  silent?: boolean;
}) => {
  const dataDirRelativePath = getRelativePath({
    path: dataDir,
    parentPath: PKG_DIR,
  });

  const jarPath = getOtpJarPaths()[0];
  if (downloadJar || !jarPath) {
    if (downloadJar) {
      printInfo('Downloading latest OpenTripPlanner release.');
    } else {
      printWarn('OpenTripPlanner release missing.');
    }
    await downloadOtp();
  }

  const transitGraphFound = existsSync(
    joinPath(dataDir, OTP_TRANSIT_GRAPH_FILENAME)
  );
  if (buildGraphs || !transitGraphFound) {
    if (buildGraphs) {
      printInfo(
        `Building new OpenTripPlanner transit graph in ${dataDirRelativePath}.`
      );
    } else {
      printWarn(
        `OpenTripPlanner transit graph missing in ${dataDirRelativePath}.`
      );
    }
    await buildOtp({
      dataDir,
      buildStreetGraph: true,
      jvmMemory,
      silent,
    });
  }

  printInfo('Running OpenTripPlanner instance...');
  return spawnCmd({
    name: 'otp',
    cmd: 'java',
    args: [
      `-${jvmMemory}`,
      '-jar',
      jarPath,
      '--port',
      `${port}`,
      '--load',
      dataDir,
    ],
    silent,
  });
};

/** Generates GraphQL types and helpers for OpenTripPlanner. */
export const generateOtpSchema = async () => {
  const distDirContentPaths = globSync(joinPath(DIST_DIR, '*.{js,ts}'));

  if (!existsSync(DIST_DIR)) {
    printInfo('Creating dist directory...');
    mkdirSync(DIST_DIR);
  } else if (distDirContentPaths.length) {
    printWarn('Deleting contents of existing dist directory...');
    for (const contentPath of distDirContentPaths) {
      unlinkSync(contentPath);
    }
  }

  const runCodegen = async () => {
    printInfo('Generating OpenTripPlanner GraphQL schema...');
    await spawnCmd({name: 'otp', cmd: 'graphql-codegen'}).resolved;
  };

  if (await isPortBusy({port: OTP_PORT, timeoutMs: 0, maxTries: 1})) {
    // Generate immediately if OTP is already running.
    printInfo(
      'OpenTripPlanner server is already running. Using existing instance...'
    );
    await runCodegen();
  } else {
    const {proc: runOtpProc, resolved: runOtpResolved} = await runOtp({
      dataDir: EMPTY_DATA_DIR,
      silent: true,
    });
    runOtpResolved.catch(err => {
      handleError(err);
    });

    if (!(await isPortBusy({port: OTP_PORT}))) {
      runOtpProc.kill();
      runOtpProc.on('close', () => {
        throw new DefaultError(
          `OpenTripPlanner server failed to start on port ${OTP_PORT}.`
        );
      });
      return;
    }

    await runCodegen();
    runOtpProc.kill();
  }

  await lintFilesInDir({
    dirPath: DIST_DIR,
    pkgDirPath: PKG_DIR,
  });
};
