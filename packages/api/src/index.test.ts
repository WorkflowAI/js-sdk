import { expect, test } from '@jest/globals'

import * as mainExports from '.'
import { initWorkflowAIApi } from './WorkflowAIApi'

test('export api init function', () => {
  expect(mainExports.initWorkflowAIApi).toEqual(initWorkflowAIApi)
})
