import type { WorkflowAIApi } from './api/api.js';
import type { RunResponse } from './api/types.js';
import type { AgentId, RunOptions, SchemaId } from './types.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

export type Input = object;
export type Output = object;

export type AgentDefinition = {
  id: AgentId;
  schemaId: SchemaId;
};

export type RunResult<O extends Output> = {
  data: RunResponse;
  response: Response;
  output: O;
  feedbackToken: string;
};

// Raw async iterator that the API client returns for streaming a task run
type RawRunStreamResult = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
  >
>;

export type RunStreamEvent<O extends Output> = AsyncIteratorValue<
  RawRunStreamResult['stream']
> & {
  output: DeepPartial<O> | undefined;
  feedbackToken: string | undefined;
};

export type RunStreamResult<O extends Output> = Pick<
  RawRunStreamResult,
  'response'
> & {
  stream: AsyncIterableIterator<RunStreamEvent<O>>;
};

export type Agent<
  I extends Input,
  O extends Output,
  Stream extends true | false = false,
> = (
  input: I,
  options?: Partial<RunOptions<Stream>>
) => Promise<RunResult<O>> & {
  stream: () => Promise<RunStreamResult<O>>;
};
