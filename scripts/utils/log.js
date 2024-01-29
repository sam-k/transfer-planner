import chalk from 'chalk';

/**
 * Prints usage information about a script to console.
 *
 * @param {string[]} commands Examples of command usage
 * @param {Record<string, string>} options Flags and their descriptions
 */
export const printUsage = (commands, options) => {
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

/**
 * Prints info messages to console.
 *
 * @param {unknown[]} msgs
 */
export const printInfo = (...msgs) => {
  const [firstMsg, ...restMsgs] = msgs;
  console.log(chalk.yellow(`[INFO] ${firstMsg}`));
  for (const msg of restMsgs) {
    console.log(chalk.yellow(`${' '.repeat('[INFO]'.length)} ${msg}`));
  }
};

/**
 * Prints error messages to console.
 *
 * @param {unknown[]} msgs
 */
export const printError = (...msgs) => {
  const [firstMsg, ...restMsgs] = msgs;
  console.error(chalk.red(`[ERROR] ${firstMsg}`));
  for (const msg of restMsgs) {
    console.error(chalk.red(`${' '.repeat('[ERROR]'.length)} ${msg}`));
  }
};
