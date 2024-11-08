import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { useESM: true, tsconfig: './tests/tsconfig.json' },
    ],
  },
  testRegex: ['src/.*\\.test\\.ts$', 'tests/.*\\.test\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  automock: false,
  setupFiles: ['./configs/setupJest.js'],
  moduleNameMapper: {
    '@workflowai/workflowai': '<rootDir>/src',
    '(.+)\\.js': '$1',
  },
};

export default config;
