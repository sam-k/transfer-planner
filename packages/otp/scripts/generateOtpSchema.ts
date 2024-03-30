import {getArgs, handleError, printUsage} from '@internal/script-utils';

import {generateOtpSchema} from './tasks';

const main = async () => {
  const argv = getArgs();
  if (argv.h || argv.help) {
    printUsage(['generate-otp-schema']);
    return;
  }

  try {
    await generateOtpSchema();
  } catch (err) {
    handleError(err);
  }
};

main();
