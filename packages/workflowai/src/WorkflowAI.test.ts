import { WorkflowAI } from './WorkflowAI.js';
import { z } from './schema/zod/zod.js';

interface TaskInput1 {
  a: string;
}

const workflowAI = new WorkflowAI({
  url: 'https://test.workflowai.com',
  key: 'test',
});

describe('useTask', () => {
  it('should return a run function', () => {
    const run = workflowAI.agent<TaskInput1, TaskInput1>({
      id: 'bla',
      schemaId: 2,
    });
    expect(run).toBeDefined();
  });

  it('is compatible with the old zod schema', () => {
    const task = workflowAI.useTask(
      {
        taskId: 'detect-company-domain',
        schema: {
          id: 1,
          input: z.object({
            messages: z
              .array(
                z.object({
                  role: z.enum(['USER', 'ASSISTANT']).optional(),
                  content: z.string().optional(),
                })
              )
              .optional(),
          }),
          output: z.object({
            company_domain: z.string().nullable().default(null),
            failure_assistant_answer: z.string().nullable().default(null),
          }),
        },
      },
      {
        version: 'production',
      }
    );
    expect(task).toBeDefined();
  });
});
