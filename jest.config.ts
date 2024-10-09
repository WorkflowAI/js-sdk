import type { Config } from 'jest'

const config: Config = {
  rootDir: '.',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { useESM: true, tsconfig: './configs/tsconfig.tests.json' },
    ],
  },
  testRegex: ['packages/.*/src/.*\\.test\\.ts$', 'tests/.*\\.test\\.ts$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  automock: false,
  setupFiles: ['./configs/setupJest.js'],
  moduleNameMapper: {
    '(.+)\\.js': '$1',
    '@workflowai/workflowai': '<rootDir>/packages/client/src',
  },
}

export default config
