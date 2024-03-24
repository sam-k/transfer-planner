import {spawnCmd} from '../src';

const main = async () => {
  await spawnCmd({
    name: 'script-utils',
    cmd: 'tsc',
  });
};

main();
