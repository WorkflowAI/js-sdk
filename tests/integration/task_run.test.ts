import { WorkflowAI, WorkflowAIError, z } from '@workflowai/workflowai';
import mockFetch from 'jest-fetch-mock';
// eslint-disable-next-line no-restricted-imports
import { readFile } from 'node:fs/promises';
import { fixturePath } from '../fixtures/fixture.js';

// Old way to run tasks, makes sure it's backwards compatible

beforeAll(() => {
  mockFetch.enableMocks();
});

afterAll(() => {
  mockFetch.disableMocks();
});

beforeEach(() => {
  mockFetch.resetMocks();
});

const workflowAI = new WorkflowAI({
  api: { url: 'https://run.workflowai.com', key: 'hello' },
});

describe('run', () => {
  const { run } = workflowAI.useTask(
    {
      taskId: 'animal-classification',
      schema: {
        id: 4,
        input: z.object({
          animal: z.string().optional(),
        }),
        output: z.object({
          is_cute: z.boolean().optional(),
          is_dangerous: z.boolean().optional(),
          explanation_of_reasoning: z.string().optional(),
        }),
      },
    },
    {
      version: 43,
    }
  );

  it('runs a task', async () => {
    const run1Fixture = await readFile(fixturePath('run1.json'), 'utf-8');
    mockFetch.mockResponseOnce(run1Fixture);

    const result = await run({ animal: 'platypus' });
    expect(result.output).toEqual({
      is_cute: true,
      is_dangerous: true,
      explanation_of_reasoning: 'Plat plat',
    });

    expect(result.data.version.properties.model).toEqual('gpt-4o-2024-08-06');
    expect(result.data.cost_usd).toEqual(0.0024200000000000003);
    expect(result.data.duration_seconds).toEqual(1.311426);
    expect(result.feedbackToken).toEqual(
      'b650f038-e54e-41cf-9934-f57713fb9402'
    );

    expect(mockFetch.mock.calls.length).toEqual(1);
    const req = mockFetch.mock.calls[0][0] as Request;
    expect(req.url).toEqual(
      'https://run.workflowai.com/v1/_/agents/animal-classification/schemas/4/run'
    );
    expect(req.method).toEqual('POST');
    expect(req.headers.get('Authorization')).toEqual('Bearer hello');
    const body = await req.json();
    expect(body).toEqual({
      version: 43,
      stream: false,
      task_input: {
        animal: 'platypus',
      },
      use_cache: 'auto',
    });
  });

  it('correctly handles detailed errors', async () => {
    mockFetch.mockResponseOnce(
      JSON.stringify({
        error: {
          code: 'object_not_found',
          message: 'Invalid request',
          status_code: 404,
          details: {
            whatever: 'whatever',
          },
        },
      }),
      { status: 404 }
    );

    try {
      await run({ animal: 'platypus' });
      // If we get here, the test failed
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(WorkflowAIError);
      if (!(error instanceof WorkflowAIError)) {
        expect(true).toBe(false);
        return;
      }
      expect(error.errorCode).toBe('object_not_found');
    }
  });

  it('correctly handles unknown errors', async () => {
    mockFetch.mockResponseOnce('Internal Error', { status: 500 });

    try {
      await run({ animal: 'platypus' });
      // If we get here, the test failed
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(WorkflowAIError);
      if (!(error instanceof WorkflowAIError)) {
        expect(true).toBe(false);
        return;
      }
      expect(error.errorCode).toBeFalsy();
    }
  });
});
