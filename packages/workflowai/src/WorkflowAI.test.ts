import fetchMock from 'jest-fetch-mock';
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

describe('sendFeedback', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should successfully send feedback', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));

    await workflowAI.sendFeedback({
      feedbackToken: 'test-token',
      outcome: 'positive',
      comment: 'Great work!',
      userID: 'user123',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://test.workflowai.com/v1/feedback',
      {
        method: 'POST',
        body: JSON.stringify({
          feedback_token: 'test-token',
          outcome: 'positive',
          comment: 'Great work!',
          user_id: 'user123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should handle negative feedback', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));

    await workflowAI.sendFeedback({
      feedbackToken: 'test-token',
      outcome: 'negative',
      comment: 'Needs improvement',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://test.workflowai.com/v1/feedback',
      {
        method: 'POST',
        body: JSON.stringify({
          feedback_token: 'test-token',
          outcome: 'negative',
          comment: 'Needs improvement',
          user_id: undefined,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should throw error when feedback request fails', async () => {
    fetchMock.mockResponseOnce('', { status: 400 });

    await expect(
      workflowAI.sendFeedback({
        feedbackToken: 'test-token',
        outcome: 'positive',
      })
    ).rejects.toThrow('Failed to send feedback');
  });
});
