import {isObject, transform} from 'lodash-es';

/**
 * Recursively omits keys from an object.
 *
 * @param {{}} obj
 * @param {string[]} keysToOmit
 * @returns {{}}
 */
export const deepOmit = (obj, keysToOmit) => {
  const keySetToOmit = new Set(keysToOmit);

  const deepOmitInternal = (/** @type {{}} */ obj) => {
    return transform(obj, (res, value, key) => {
      if (keySetToOmit.has(key)) {
        return;
      }
      res[key] = isObject(value) ? deepOmitInternal(value) : value;
    });
  };

  return deepOmitInternal(obj);
};

/**
 * Prints usage information about a script.
 *
 * @param {string[]} commands Examples of command usage
 * @param {Record<string, string>} options Flags and their descriptions
 */
export const printUsage = (commands, options) => {
  console.log(`Usage: ${commands[0]}`);
  for (let i = 1; i < commands.length; i++) {
    console.log(`       ${commands[i]}`);
  }

  console.log('\nOptions:');
  const optionPadLen =
    Math.max(...Object.keys(options).map(flag => flag.length)) + 4;
  for (const [flag, desc] of Object.entries(options)) {
    console.log(`${flag.padEnd(optionPadLen)}${desc}`);
  }
};
