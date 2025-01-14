import type { WorkflowAIApi } from './api/api.js';
import type { RunResponse } from './api/types.js';
import type { AgentId, RunOptions, SchemaId } from './types.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

export type AgentInput = object;
export type AgentOutput = object;

export type AgentDefinition = {
  id: AgentId;
  schemaId: SchemaId;
};

export type RunResult<O extends AgentOutput> = {
  data: RunResponse;
  response: Response;
  output: O;
};

// Raw async iterator that the API client returns for streaming a task run
type RawRunStreamResult = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
  >
>;

export type RunStreamEvent<O extends AgentOutput> = AsyncIteratorValue<
  RawRunStreamResult['stream']
> & {
  output: DeepPartial<O> | undefined;
};

export type RunStreamResult<O extends AgentOutput> = Pick<
  RawRunStreamResult,
  'response'
> & {
  stream: AsyncIterableIterator<RunStreamEvent<O>>;
};

export type Agent<
  I extends AgentInput,
  O extends AgentOutput,
  Stream extends true | false = false,
> = (
  input: I,
  options?: Partial<RunOptions<Stream>>
) => Promise<RunResult<O>> & {
  stream: () => Promise<RunStreamResult<O>>;
};
