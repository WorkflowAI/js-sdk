import type { RunOptions } from './WorkflowAI.js';
import type { WorkflowAIApi } from './api/api.js';
import type { RunResponse } from './api/types.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

type TaskId = string;
type SchemaId = number;

export type InputSchema = Record<string, unknown>;
export type OutputSchema = Record<string, unknown>;

export type Input = object;
export type Output = object;

export type Definition = {
  taskId: TaskId;
  schemaId: SchemaId;
};

export type RunResult<O extends Output> = {
  data: RunResponse;
  response: Response;
  output: O;
};

// Raw async iterator that the API client returns for streaming a task run
type RawRunStreamResult = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['agents']['schemas']['run']>['stream']>
  >
>;

export type RunStreamEvent<O extends Output> = AsyncIteratorValue<
  RawRunStreamResult['stream']
> & {
  output: DeepPartial<O> | undefined;
};

export type RunStreamResult<O extends Output> = Pick<
  RawRunStreamResult,
  'response'
> & {
  stream: AsyncIterableIterator<RunStreamEvent<O>>;
};

export type RunFn<
  I extends Input,
  O extends Output,
  Stream extends true | false = false,
> = (
  input: I,
  options?: Partial<RunOptions<Stream>>
) => Promise<RunResult<O>> & {
  stream: () => Promise<RunStreamResult<O>>;
};

export type AgentResult<
  I extends Input,
  O extends Output,
  Stream extends true | false = false,
> = {
  run: RunFn<I, O, Stream>;
};
