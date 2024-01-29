import chalk from 'chalk';

/**
 * Prints usage information about a script to console.
 *
 * @param {string[]} commands Examples of command usage
 * @param {Record<string, string>=} options Flags and their descriptions
 */
export const printUsage = (commands, options = {}) => {
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
 * Logs a message to console.
 *
 * @param {string} prefix
 * @param {(msg: string) => string} formatter
 * @param {[unknown, ...unknown[]]} msgs
 */
const printLog = (prefix, formatter, ...msgs) => {
  const [firstMsg, ...restMsgs] = msgs;
  console.log(formatter(`${prefix} ${firstMsg}`));
  for (const msg of restMsgs) {
    console.log(formatter(`${' '.repeat(prefix.length)} ${msg}`));
  }
};

/**
 * Prints info messages to console.
 *
 * @param {[unknown, ...unknown[]]} msgs
 */
export const printInfo = (...msgs) => {
  printLog('[INFO]', chalk.yellow, ...msgs);
};

/**
 * Prints warning messages to console.
 *
 * @param  {[unknown, ...unknown[]]} msgs
 */
export const printWarn = (...msgs) => {
  printLog('[WARN]', chalk.magenta, ...msgs);
};

/**
 * Prints error messages to console.
 *
 * @param {[unknown, ...unknown[]]} msgs
 */
export const printError = (...msgs) => {
  printLog('[ERROR]', chalk.red, ...msgs);
};
