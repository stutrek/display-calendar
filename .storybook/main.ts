import type { StorybookConfig } from '@storybook/preact-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/preact-vite',
  viteFinal: async (config) => {
    if (process.env.STORYBOOK_BASE) {
      config.base = process.env.STORYBOOK_BASE;
    }
    return config;
  },
};

export default config;
