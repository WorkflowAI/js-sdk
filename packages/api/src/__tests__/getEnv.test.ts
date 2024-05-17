/* eslint-disable @typescript-eslint/ban-ts-comment */

import { expect, test } from '@jest/globals'

import { getEnv } from '../utils/getEnv'

const rand = (): string => `RANDOM${String(Math.random()).split('.').pop()}`

test('return undefined for missign env var', () => {
  expect(getEnv(rand())).toBeUndefined()
})

test('return value from env', () => {
  const varName = rand()
  const value = rand()
  process.env[varName] = value
  expect(getEnv(varName)).toEqual(value)
})

test('return undefined when process is missing (browsers)', () => {
  const varName = rand()
  const value = rand()
  process.env[varName] = value
  expect(getEnv(varName)).toEqual(value)

  const p = global.process
  // @ts-ignore
  global.process = undefined

  expect(global.process).toBeUndefined()
  expect(getEnv(varName)).toBeUndefined()

  global.process = p
})
