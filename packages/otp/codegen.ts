/* eslint-disable node/no-unpublished-import */

import type {CodegenConfig} from '@graphql-codegen/cli';
import {OTP_GTFS_GRAPHQL_ENDPOINT} from '@internal/constants';

const config: CodegenConfig = {
  schema: OTP_GTFS_GRAPHQL_ENDPOINT,
  generates: {
    './dist/graphql.ts': {
      plugins: ['typescript'],
    },
  },
} as const;

export default config;
