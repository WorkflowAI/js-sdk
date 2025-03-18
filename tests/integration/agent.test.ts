import { WorkflowAI, WorkflowAIError } from '@workflowai/workflowai';
import mockFetch from 'jest-fetch-mock';
// eslint-disable-next-line no-restricted-imports
import { readFile } from 'node:fs/promises';
import { fixturePath } from '../fixtures/fixture.js';

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
  url: 'https://run.workflowai.com',
  key: 'hello',
});

type AnimalClassificationInput = {
  animal: string;
};

type AnimalClassificationOutput = {
  is_cute: boolean;
  is_dangerous: boolean;
  explanation_of_reasoning: string;
};

const run = workflowAI.agent<
  AnimalClassificationInput,
  AnimalClassificationOutput
>({
  id: 'animal-classification',
  schemaId: 4,
  version: 43,
});

describe('run', () => {
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

    expect(mockFetch.mock.calls.length).toEqual(1);
    const req = mockFetch.mock.calls[0][0] as Request;
    expect(req.url).toEqual(
      'https://run.workflowai.com/v1/_/tasks/animal-classification/schemas/4/run'
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

  it('correctly handles detailed error schemas', async () => {
    mockFetch.mockResponseOnce(
      JSON.stringify({
        error: {
          code: 'schema_not_found',
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
      expect(error.errorCode).toBe('schema_not_found');
    }
  });

  it('correctly handles detailed error authentication', async () => {
    mockFetch.mockResponseOnce(
      JSON.stringify({
        error: {
          details: 'Invalid jwt',
        },
      }),
      { status: 401 }
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
      expect(error.message).toContain('Invalid jwt');
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
