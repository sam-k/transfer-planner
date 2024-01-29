import {request as gitHubRequest} from '@octokit/request';
import {RequestError as GitHubRequestError} from '@octokit/request-error';
import chalk from 'chalk';
import {unlinkSync} from 'fs';
import {globSync} from 'glob';
import minimist from 'minimist';
import {join as joinPath} from 'path';

import {
  DownloadError,
  downloadFromUrl,
  getAbsolutePath,
  handleError,
  printInfo,
  printUsage,
  spawnCmd,
} from '../utils/index.js';

const OTP_DIR = getAbsolutePath('otp');

const OTP_JAR_GLOB_PATH = joinPath(OTP_DIR, 'otp-*.jar');
const OTP_JAR_REGEX = /otp-(.*)-shaded\.jar$/;
const OTP_STREETGRAPH_GLOB_PATH = joinPath(OTP_DIR, 'streetGraph.obj');

const OTP_GITHUB_OWNER = 'opentripplanner';
const OTP_GITHUB_REPO = 'OpenTripPlanner';

/**
 * Extracts the OpenTripPlanner release version from its filename.
 *
 * @param {string} filename
 * @returns {string}
 */
const extractOtpVersion = filename => filename.match(OTP_JAR_REGEX)?.[1] ?? '';

/**
 * Downloads the latest OpenTripPlanner release from GitHub.
 *
 * @param {boolean=} overwriteJar Whether to delete any existing releases
 * @returns {Promise<void>}
 */
const downloadOtp = async (overwriteJar = false) => {
  if (overwriteJar) {
    const jarPaths = globSync(OTP_JAR_GLOB_PATH);
    if (jarPaths.length) {
      printInfo(
        `Deleting OpenTripPlanner version${
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
  }

  try {
    const releaseResponse = await gitHubRequest(
      'GET /repos/{owner}/{repo}/releases/latest',
      {
        owner: OTP_GITHUB_OWNER,
        repo: OTP_GITHUB_REPO,
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
  console.log('HERE');
};

/**
 * Builds an OpenTripPlanner transit graph.
 *
 * @param {boolean=} buildStreet Whether to build the street graph
 * @param {string=} jvmMemory Maximum allocated memory for the JVM
 * @returns {Promise<void>}
 */
const buildOtp = async (buildStreet = false, jvmMemory = 'Xmx8G') => {
  const otpPath = globSync(OTP_JAR_GLOB_PATH)[0];
  if (!otpPath) {
    // Fetch OpenTripPlanner release if missing.
    printInfo('OpenTripPlanner release missing. Downloading...');
    await downloadOtp();
  }

  if (buildStreet || !globSync(OTP_STREETGRAPH_GLOB_PATH)[0]) {
    printInfo('Building OpenTripPlanner street graph. This may take a while..');
    await spawnCmd({
      name: 'otp',
      cmd: 'java',
      args: [`-${jvmMemory}`, '-jar', otpPath, '--buildStreet', './data'],
    });
  }
  printInfo('Building OpenTripPlanner transit graph...');
  await spawnCmd({
    name: 'otp',
    cmd: 'java',
    args: [
      `-${jvmMemory}`,
      '-jar',
      otpPath,
      '--loadStreet',
      '--save',
      './data',
    ],
  });
};

const main = async () => {
  const argv = minimist(process.argv.slice(2));
  if (argv.h || argv.help) {
    printUsage(['buildOtp [options]'], {
      '-h, --help': 'Display usage information',
      '-m, --jvmMemory':
        'Maximum allocated memory for the JVM (default: Xmx8G)',
      '-s, --buildStreet': 'Build street data (resource-intensive)',
      '-u, --update': 'Update OpenTripPlanner to the latest release',
    });
    return;
  }

  try {
    if (argv.u || argv.update) {
      await downloadOtp(/* overwriteJar= */ true);
    }
    await buildOtp(argv.s || argv.buildStreet, argv.m || argv.jvmMemory);
  } catch (err) {
    handleError(err);
  }
};

main();
