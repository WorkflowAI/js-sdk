import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  projects: [
    '<rootDir>/configs/jest.unit.config.ts',
    '<rootDir>/configs/jest.e2e.config.ts',
  ],
};

export default config;
