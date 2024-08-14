import { expect, test } from '@jest/globals'

import * as mainExports from './index.js'
import { initWorkflowAIApi } from './WorkflowAIApi.js'

test('export api init function', () => {
  expect(mainExports.initWorkflowAIApi).toEqual(initWorkflowAIApi)
})
