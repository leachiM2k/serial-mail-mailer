import type { Configuration } from 'webpack';

import { rules, nativeModuleRules } from './webpack.rules';

export const mainConfig: Configuration = {
  entry: './src/index.ts',
  module: {
    rules: [...nativeModuleRules, ...rules],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
