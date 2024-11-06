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
    '(.+)\\.js': '$1',
    '@workflowai/workflowai': '<rootDir>/src',
    '@/api': '<rootDir>/src/api',
    '@/schema': '<rootDir>/src/schema',
  },
};

export default config;
