import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'path';
import { mergeConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    {
      name: getAbsolutePath('@storybook/addon-essentials'),
      options: {
        docs: false,
      },
    },
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      plugins: [viteTsConfigPaths()],
      define: {
        'process.env': {},
      },
    });
  },
};
export default config;
