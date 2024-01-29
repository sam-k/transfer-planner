import {buildOtp} from './tasks/index.js';
import {getArgs, handleError, printUsage} from './utils/index.js';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['build-otp [options]'], {
      '-h, --help': 'Display usage information',
      '-m, --jvmMemory':
        'Maximum allocated memory for the JVM (default: Xmx8G)',
      '-s, --buildStreet': 'Build new street graph (resource-intensive)',
      '-u, --update': 'Update OpenTripPlanner to the latest release',
    });
    return;
  }

  try {
    await buildOtp({
      downloadJar: argv.u || argv.update,
      buildStreetGraph: argv.s || argv.buildStreet,
      jvmMemory: argv.m || argv.jvmMemory,
    });
  } catch (err) {
    handleError(err);
  }
};

main();
