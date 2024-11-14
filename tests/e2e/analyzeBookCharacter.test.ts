import { TaskInput, TaskOutput, WorkflowAI, z } from '@workflowai/workflowai';
import 'dotenv/config';

const workflowAI = new WorkflowAI();

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

describe('analyzeBookCharacter', () => {
  it('runs', async () => {
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

  type BookCharacterTaskOutput = TaskOutput<typeof analyzeBookCharacters>;

  it('streams', async () => {
    const input: TaskInput<typeof analyzeBookCharacters> = {
      book_title: 'The Shadow of the Wind',
    };
    const { stream } = await analyzeBookCharacters(input, {
      useCache: 'never',
    }).stream();

    const chunks: BookCharacterTaskOutput[] = [];
    for await (const chunk of stream) {
      if (chunk.output) {
        chunks.push(chunk.output);
      }
    }

    expect(chunks.length).toBeGreaterThan(1);
  }, 30000);
});
