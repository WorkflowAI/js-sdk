import { expect, test } from '@jest/globals';
import { initWorkflowAIApi } from './WorkflowAIApi.js';
import * as mainExports from './index.js';

test('export api init function', () => {
  expect(mainExports.initWorkflowAIApi).toEqual(initWorkflowAIApi);
});
