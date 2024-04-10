import chalk from 'chalk';

/**
 * Prints usage information about a script to console.
 *
 * @param commands Examples of command usage
 * @param options Flags and their descriptions
 */
export const printUsage = (
  commands: string[],
  options: Record<string, string> = {}
) => {
  console.log(`Usage: ${commands[0]}`);
  for (let i = 1; i < commands.length; i++) {
    console.log(`${' '.repeat('Usage: '.length)}${commands[i]}`);
  }

  console.log('\nOptions:');
  const optionPadLen =
    Math.max(...Object.keys(options).map(flag => flag.length)) + 4;
  for (const [flag, desc] of Object.entries(options)) {
    console.log(`${flag.padEnd(optionPadLen)}${desc}`);
  }
};

/** Logs a message to console. */
const printLog = (
  prefix: string,
  formatter: (msg: string) => string,
  ...msgs: [unknown, ...unknown[]]
) => {
  const [firstMsg, ...restMsgs] = msgs;
  if (firstMsg != null) {
    console.log(formatter(`${prefix} ${firstMsg}`));
  }
  for (const msg of restMsgs) {
    console.log(formatter(`${' '.repeat(prefix.length)} ${msg}`));
  }
};

/** Prints info messages to console. */
export const printInfo = (...msgs: [unknown, ...unknown[]]) => {
  printLog('[INFO]', chalk.yellow, ...msgs);
};

/** Prints warning messages to console. */
export const printWarn = (...msgs: [unknown, ...unknown[]]) => {
  printLog('[WARN]', chalk.magenta, ...msgs);
};

/** Prints error messages to console. */
export const printError = (...msgs: [unknown, ...unknown[]]) => {
  printLog('[ERROR]', chalk.red, ...msgs);
};
