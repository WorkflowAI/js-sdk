import type { Config } from 'jest';

const config: Config = {
  rootDir: '..',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { useESM: true, tsconfig: '<rootDir>/tests/tsconfig.json' },
    ],
  },
  testRegex: ['tests/e2e/.*\\.test\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  automock: false,
  moduleNameMapper: {
    '@workflowai/workflowai': '<rootDir>/src',
    '(.+)\\.js': '$1',
  },
};

export default config;
