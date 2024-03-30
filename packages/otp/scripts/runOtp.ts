import {getArgs, handleError, printUsage} from '@internal/script-utils';

import {runOtp} from './tasks';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['run-otp [options]'], {
      '-b, --build': 'Build new street and transit graphs (resource-intensive)',
      '-h, --help': 'Display usage information',
      '-m, --jvmMemory':
        'Maximum allocated memory for the JVM (default: Xmx8G)',
      '-p, --port': 'Port for the server',
      '-u, --update': 'Update OpenTripPlanner to the latest release',
    });
    return;
  }

  try {
    await (
      await runOtp({
        downloadJar: argv.u || argv.update,
        buildGraphs: argv.b || argv.build,
        jvmMemory: argv.m || argv.jvmMemory,
        port: argv.p || argv.port,
      })
    ).resolved;
  } catch (err) {
    handleError(err);
  }
};

main();
