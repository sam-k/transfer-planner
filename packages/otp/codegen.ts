/* eslint-disable node/no-unpublished-import */

import type {CodegenConfig} from '@graphql-codegen/cli';
import {OTP_GTFS_GRAPHQL_ENDPOINT} from '@internal/constants';

const config: CodegenConfig = {
  schema: OTP_GTFS_GRAPHQL_ENDPOINT,
  generates: {
    './dist/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        // Gathered from
        // https://github.com/opentripplanner/OpenTripPlanner/blob/c1a91969c5007e539d580926d9e52c15b3f9e7b0/src/main/java/org/opentripplanner/apis/gtfs/GraphQLScalars.java.
        scalars: {
          Duration: 'string',
          GeoJson: 'geojson#GeoJSON', // Type import from package
          Grams: 'number',
          Long: 'number',
          Polyline: 'string',
        },
      },
    },
  },
} as const;

export default config;
