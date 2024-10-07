import type { Config } from 'jest'

const config: Config = {
  rootDir: '.',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { useESM: true, tsConfig: './configs/tsconfig.base.json' },
    ],
  },
  testRegex: 'packages/.*/src/.*\\.test\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  automock: false,
  setupFiles: ['./configs/setupJest.js'],
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
}

export default config
