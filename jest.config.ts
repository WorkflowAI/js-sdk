import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  projects: [
    '<rootDir>/packages/workflowai/jest.config.ts',
    '<rootDir>/configs/jest.e2e.config.ts',
  ],
};

export default config;
