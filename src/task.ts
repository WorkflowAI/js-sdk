import type { RunTaskOptions } from './WorkflowAI.js';
import type { WorkflowAIApi } from './api/api.js';
import type { RunResponse } from './api/types.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

type TaskId = string;
type SchemaId = number;

export type InputSchema = Record<string, unknown>;
export type OutputSchema = Record<string, unknown>;

export type TaskInput = Record<string, unknown>;
export type TaskOutput = Record<string, unknown>;

export type TaskDefinition = {
  taskId: TaskId;
  schemaId: SchemaId;
};

export type TaskRunResult<O extends TaskOutput> = {
  data: RunResponse;
  response: Response;
  output: O;
};

// Raw async iterator that the API client returns for streaming a task run
type RawTaskRunStreamResult = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
  >
>;

export type TaskRunStreamEvent<O extends TaskOutput> = AsyncIteratorValue<
  RawTaskRunStreamResult['stream']
> & {
  output: DeepPartial<O> | undefined;
};

export type TaskRunStreamResult<O extends TaskOutput> = Pick<
  RawTaskRunStreamResult,
  'response'
> & {
  stream: AsyncIterableIterator<TaskRunStreamEvent<O>>;
};

export type RunFn<
  I extends TaskInput,
  O extends TaskOutput,
  Stream extends true | false = false,
> = (
  input: I,
  options?: Partial<RunTaskOptions<Stream>>
) => Promise<TaskRunResult<O>> & {
  stream: () => Promise<TaskRunStreamResult<O>>;
};

export type UseTaskResult<
  I extends TaskInput,
  O extends TaskOutput,
  Stream extends true | false = false,
> = {
  run: RunFn<I, O, Stream>;
};
