import {downloadDataGroups} from './tasks/index.js';
import {getArgs, handleError, printUsage} from './utils/index.js';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['install-data <data-source-group-ids>...', 'installData'], {
      '-h, --help': 'Display usage information',
    });
    return;
  }

  try {
    await downloadDataGroups(argv._);
  } catch (err) {
    handleError(err);
  }
};

main();
