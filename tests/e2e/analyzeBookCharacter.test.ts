import { Input, Output, WorkflowAI } from '@workflowai/workflowai';
import 'dotenv/config';
import { DeepPartial } from 'utils';

const workflowAI = new WorkflowAI();

interface BookCharacterTaskInput extends Input {
  book_title: string;
}

interface Character {
  name: string;
  goals: string[];
  weaknesses: string[];
  outcome: string;
}

interface BookCharacterTaskOutput extends Output {
  characters: Character[];
}

// Initialize Your Agent
const { run: analyzeBookCharacters } = workflowAI.agent<
  BookCharacterTaskInput,
  BookCharacterTaskOutput
>({
  taskId: 'analyze-book-characters',
  schemaId: 1,
  version: 'production',
});

describe('analyzeBookCharacter', () => {
  it('runs', async () => {
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
    const input: BookCharacterTaskInput = {
      book_title: 'The Shadow of the Wind',
    };
    const { stream } = await analyzeBookCharacters(input, {
      useCache: 'never',
    }).stream();

    const chunks: DeepPartial<BookCharacterTaskOutput>[] = [];
    for await (const chunk of stream) {
      if (chunk.output) {
        chunks.push(chunk.output);
      }
    }

    expect(chunks.length).toBeGreaterThan(1);
  }, 30000);
});
