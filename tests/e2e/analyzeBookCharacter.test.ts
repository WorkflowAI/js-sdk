import {
  RunStreamEvent,
  TaskInput,
  TaskOutput,
  WorkflowAI,
  WorkflowAIError,
  z,
} from '@workflowai/workflowai';
import 'dotenv/config';

const workflowAI = new WorkflowAI();

interface BookCharacterTaskInput {
  book_title: string;
}

interface Character {
  name: string;
  goals: string[];
  weaknesses: string[];
  outcome: string;
}

interface BookCharacterTaskOutput {
  characters: Character[];
}

describe('analyzeBookCharacter', () => {
  it('runs with agent', async () => {
    // Initialize Your Task
    const analyzeBookCharacters = workflowAI.agent<
      BookCharacterTaskInput,
      BookCharacterTaskOutput
    >({
      id: 'analyze-book-characters',
      schemaId: 1,
      version: 'production',
    });

    const input: BookCharacterTaskInput = {
      book_title: 'The Shadow of the Wind',
    };
    const {
      output,
      data: { duration_seconds, cost_usd, version },
    } = await analyzeBookCharacters(input, { useCache: 'never' });

    expect(output).toBeDefined();
    expect(duration_seconds).toBeGreaterThan(0);
    expect(cost_usd).toBeGreaterThan(0);
    expect(version.properties.model).toBeDefined();
  }, 30000);

  it('streams', async () => {
    const analyzeBookCharacters = workflowAI.agent<
      BookCharacterTaskInput,
      BookCharacterTaskOutput
    >({
      id: 'analyze-book-characters',
      schemaId: 1,
      version: 'production',
    });

    const input: BookCharacterTaskInput = {
      book_title: 'The Shadow of the Wind',
    };
    const { stream } = await analyzeBookCharacters(input).stream();

    let lastChunk: RunStreamEvent<BookCharacterTaskOutput> | undefined;
    for await (const chunk of stream) {
      lastChunk = chunk;
    }
    console.log(lastChunk?.feedbackToken);
    expect(lastChunk).toBeDefined();
    expect(lastChunk?.feedbackToken).toBeDefined();
    expect(lastChunk?.output).toBeDefined();
  }, 30000);

  it('runs', async () => {
    // Initialize Your Task
    const { run: analyzeBookCharacters } = workflowAI.useTask(
      {
        taskId: 'analyze-book-characters',
        schema: {
          id: 1,
          input: z.object({
            book_title: z.string().optional(),
          }),
          output: z.object({
            characters: z
              .array(
                z.object({
                  name: z.string().optional(),
                  goals: z.array(z.string()).optional(),
                  weaknesses: z.array(z.string()).optional(),
                  outcome: z.string().optional(),
                })
              )
              .optional(),
          }),
        },
      },
      {
        version: 'production',
      }
    );
    const input: TaskInput<typeof analyzeBookCharacters> = {
      book_title: 'The Shadow of the Wind',
    };
    const {
      output,
      data: { duration_seconds, cost_usd, version },
    } = await analyzeBookCharacters(input, { useCache: 'never' });

    expect(output).toBeDefined();
    expect(duration_seconds).toBeGreaterThan(0);
    expect(cost_usd).toBeGreaterThan(0);
    expect(version.properties.model).toBeDefined();
  }, 30000);

  it('streams', async () => {
    const { run: analyzeBookCharacters } = workflowAI.useTask(
      {
        taskId: 'analyze-book-characters',
        schema: {
          id: 1,
          input: z.object({
            book_title: z.string().optional(),
          }),
          output: z.object({
            characters: z
              .array(
                z.object({
                  name: z.string().optional(),
                  goals: z.array(z.string()).optional(),
                  weaknesses: z.array(z.string()).optional(),
                  outcome: z.string().optional(),
                })
              )
              .optional(),
          }),
        },
      },
      {
        version: 'production',
      }
    );
    const input: TaskInput<typeof analyzeBookCharacters> = {
      book_title: 'The Shadow of the Wind',
    };
    const { stream } = await analyzeBookCharacters(input, {
      useCache: 'never',
    }).stream();

    const chunks: TaskOutput<typeof analyzeBookCharacters>[] = [];
    for await (const chunk of stream) {
      if (chunk.output) {
        chunks.push(chunk.output);
      }
    }

    expect(chunks.length).toBeGreaterThan(1);
  }, 30000);

  it('handles errors', async () => {
    const { run: analyzeBookCharacters } = workflowAI.useTask(
      {
        taskId: 'analyze-book-characters',
        schema: {
          id: 1,
          input: z.object({
            book_title: z.string().optional(),
          }),
          output: z.object({
            characters: z
              .array(
                z.object({
                  name: z.string().optional(),
                  goals: z.array(z.string()).optional(),
                  weaknesses: z.array(z.string()).optional(),
                  outcome: z.string().optional(),
                })
              )
              .optional(),
          }),
        },
      },
      {
        version: 'dev',
      }
    );
    const input: TaskInput<typeof analyzeBookCharacters> = {
      book_title: 'The Shadow of the Wind',
    };
    try {
      await analyzeBookCharacters(input, { useCache: 'never' });
      fail('Expected an error to be thrown');
    } catch (error: unknown) {
      if (!(error instanceof WorkflowAIError)) {
        fail(`Expected an error to be thrown ${error}`);
      }
      expect(error.errorCode).toBe('version_not_found');
      expect(error.detail?.error.message).toContain(
        "No version deployed to dev for agent 'analyze-book-characters' and schema '1'."
      );
    }
  }, 30000);

  it('handles invalid auth errors', async () => {
    const workflowAI = new WorkflowAI({ api: { key: 'invalid' } });
    const { run: analyzeBookCharacters } = workflowAI.useTask(
      {
        taskId: 'analyze-book-characters',
        schema: {
          id: 1,
          input: z.object({
            book_title: z.string().optional(),
          }),
          output: z.object({
            characters: z
              .array(
                z.object({
                  name: z.string().optional(),
                  goals: z.array(z.string()).optional(),
                  weaknesses: z.array(z.string()).optional(),
                  outcome: z.string().optional(),
                })
              )
              .optional(),
          }),
        },
      },
      {
        version: 'dev',
      }
    );
    const input: TaskInput<typeof analyzeBookCharacters> = {
      book_title: 'The Shadow of the Wind',
    };
    try {
      await analyzeBookCharacters(input, { useCache: 'never' });
      fail('Expected an error to be thrown');
    } catch (error: unknown) {
      if (!(error instanceof WorkflowAIError)) {
        fail(`Expected an error to be thrown ${error}`);
      }
      expect(error.detail?.error?.details).toBe('Invalid jwt');
    }
  }, 30000);
});
