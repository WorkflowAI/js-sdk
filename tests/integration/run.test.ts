import {
  WorkflowAI,
  WorkflowAIApiRequestError,
  z,
} from '@workflowai/workflowai';
import mockFetch from 'jest-fetch-mock';
import { readFile } from 'fs/promises';

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
    group: {
      iteration: 43,
    },
  }
);

describe('run', () => {
  it('runs a task', async () => {
    const run1Fixture = await readFile('./tests/fixtures/run1.json', 'utf-8');
    mockFetch.mockResponseOnce(run1Fixture);

    const result = await run({ animal: 'platypus' });
    expect(result.output).toEqual({
      is_cute: true,
      is_dangerous: true,
      explanation_of_reasoning: 'Plat plat',
    });

    expect(result.data.group.properties.model).toEqual('gpt-4o-2024-08-06');
    expect(result.data.cost_usd).toEqual(0.0024200000000000003);
    expect(result.data.duration_seconds).toEqual(1.311426);

    expect(mockFetch.mock.calls.length).toEqual(1);
    const req = mockFetch.mock.calls[0][0] as Request;
    expect(req.url).toEqual(
      'https://run.workflowai.com/tasks/animal-classification/schemas/4/run'
    );
    expect(req.method).toEqual('POST');
    expect(req.headers.get('Authorization')).toEqual('Bearer hello');
    const body = await req.json();
    expect(body).toEqual({
      group: {
        iteration: 43,
      },
      stream: false,
      task_input: {
        animal: 'platypus',
      },
      use_cache: 'when_available',
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
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError);
      if (!(error instanceof WorkflowAIApiRequestError)) {
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
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError);
      if (!(error instanceof WorkflowAIApiRequestError)) {
        expect(true).toBe(false);
        return;
      }
      expect(error.errorCode).toBeFalsy();
    }
  });
});
