/* eslint-disable node/no-unpublished-import */

import {createWriteStream, readFileSync} from 'fs';
import {get as getHttp} from 'http';
import {get as getHttps} from 'https';
import minimist from 'minimist';

const DATA_SOURCES_CONFIG_PATH = 'config/dataSources.json';
const SECRETS_CONFIG_PATH = 'config/secrets.json';

const install = (url, outPath) =>
  new Promise((resolve, reject) => {
    const pipeFn = res => {
      res.pipe(createWriteStream(outPath));
    };

    const req = url.startsWith('https://')
      ? getHttps(url, pipeFn)
      : getHttp(url, pipeFn);
    req.on('error', err => {
      reject(err);
    });
    resolve();
  });

const main = async () => {
  const argv = minimist(process.argv.slice(2));
  if (argv.h || argv.help) {
    console.log('Syntax: installData <data-source-group-ids>...');
    return;
  }

  const dataSourceGroupIds = new Set(argv._);

  const dataSourcesConfig = JSON.parse(readFileSync(DATA_SOURCES_CONFIG_PATH));
  const secretsConfig = JSON.parse(readFileSync(SECRETS_CONFIG_PATH));

  const secrets = new Map(
    secretsConfig.secrets.map(secret => [secret.id, secret.secret])
  );

  await Promise.all(
    dataSourcesConfig.groups
      .filter(group => dataSourceGroupIds.has(group.id))
      .flatMap(group => group.sources)
      .map(source =>
        install(
          source.url.replace('${SECRET}', secrets.get(source.secretId)),
          source.fileName
        )
      )
  );
};

main();
