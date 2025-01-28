import { WorkflowAI } from './WorkflowAI.js';

interface TaskInput1 {
  a: string;
}

const workflowAI = new WorkflowAI({
  url: 'https://test.workflowai.com',
  key: 'test',
});

describe('agent', () => {
  it('should return a run function', () => {
    const task = workflowAI.agent<TaskInput1, TaskInput1>({
      taskId: 'bla',
      schemaId: 2,
    });
    expect(task.run).toBeDefined();
  });
});
