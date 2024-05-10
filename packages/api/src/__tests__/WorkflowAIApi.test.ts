import { expect, test } from '@jest/globals'
import { z } from 'zod'

import { initWorkflowAIApi } from '../WorkflowAIApi'

const apiMethod = z
  .function()
  .args(z.record(z.string(), z.any()))
  .returns(
    z.object({
      data: z.any(),
      status: z.any(),
    }),
  )

test('export api init function', () => {
  expect(initWorkflowAIApi).toBeInstanceOf(Function)
})

test('accept empty configuration', () => {
  expect(initWorkflowAIApi()).toBeTruthy()
})

test('export api routes as functions', () => {
  const outputSchema = z.record(
    z.string(),
    z.union([
      apiMethod,
      z.record(
        z.string(),
        z.union([
          apiMethod,
          z.record(
            z.string(),
            z.union([
              apiMethod,
              z.record(
                z.string(),
                z.union([apiMethod, z.record(z.string(), apiMethod)]),
              ),
            ]),
          ),
        ]),
      ),
    ]),
  )
  const api = initWorkflowAIApi()
  expect(outputSchema.parse(api)).toBeTruthy()
})
