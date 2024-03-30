/* eslint-disable node/no-unpublished-import */

import type {CodegenConfig} from '@graphql-codegen/cli';
import {OTP_PORT} from '@internal/constants';

const config: CodegenConfig = {
  schema: `http://localhost:${OTP_PORT}/otp/routers/default/index/graphql`,
  generates: {
    './dist/graphql.ts': {
      plugins: ['typescript'],
    },
  },
};
export default config;
