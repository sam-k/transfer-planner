import {getArgs, handleError, printUsage} from '@internal/script-utils';

import {downloadDataForRegions} from './tasks';
import {configureDotEnv} from './utils';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['install-data <region-ids>...', 'install-data'], {
      '-h, --help': 'Display usage information',
    });
    return;
  }

  try {
    configureDotEnv();
    await downloadDataForRegions(argv._);
  } catch (err) {
    handleError(err);
  }
};

main();
