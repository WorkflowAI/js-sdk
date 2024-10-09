import type { WorkflowAIApi } from '@workflowai/api';
import type { z } from '@workflowai/schema';
import type { ImportTaskRunOptions, RunTaskOptions } from './WorkflowAI.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

type TaskId = string;
export type InputSchema = z.ZodTypeAny;
export type OutputSchema = z.ZodTypeAny;

type TaskSchema<
  IS extends InputSchema,
  OS extends OutputSchema,
  OptionalId extends boolean = false,
> = {
  input: IS;
  output: OS;
} & (OptionalId extends true
  ? { id?: number | null | undefined }
  : { id: number });

export type TaskDefinition<
  IS extends InputSchema,
  OS extends OutputSchema,
  OptionalSchemaId extends boolean = false,
> = {
  taskId: TaskId;
  taskName?: string | null | undefined;
  schema: TaskSchema<IS, OS, OptionalSchemaId>;
};

export function hasSchemaId<IS extends InputSchema, OS extends OutputSchema>(
  taskDef: TaskDefinition<IS, OS, true | false>
): taskDef is TaskDefinition<IS, OS, false> {
  return taskDef.schema.id != null;
}

export type TaskRunResult<OS extends OutputSchema> = Pick<
  Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>>,
  'data' | 'response'
> & {
  output: TaskOutput<OS>;
};

// Raw async iterator that the API client returns for streaming a task run
type RawTaskRunStreamResult = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
  >
>;

export type TaskRunStreamEvent<OS extends OutputSchema> = AsyncIteratorValue<
  RawTaskRunStreamResult['stream']
> & {
  output: TaskOutput<OS> | undefined;
  partialOutput: DeepPartial<TaskOutput<OS>> | undefined;
};

export type TaskRunStreamResult<OS extends OutputSchema> = Pick<
  RawTaskRunStreamResult,
  'response'
> & {
  stream: AsyncIterableIterator<TaskRunStreamEvent<OS>>;
};

export type RunFn<
  IS extends InputSchema,
  OS extends OutputSchema,
  Stream extends true | false = false,
> = (
  input: TaskInput<IS>,
  options?: Partial<RunTaskOptions<Stream>>
) => Promise<TaskRunResult<OS>> & {
  stream: () => Promise<TaskRunStreamResult<OS>>;
};

export type ImportRunFn<IS extends InputSchema, OS extends OutputSchema> = (
  input: TaskInput<IS>,
  output: TaskOutput<OS>,
  options?: Partial<ImportTaskRunOptions>
) => Promise<
  Pick<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['runs']['import']>>,
    'data' | 'response'
  >
>;

export type UseTaskResult<
  IS extends InputSchema,
  OS extends OutputSchema,
  Stream extends true | false = false,
> = {
  run: RunFn<IS, OS, Stream>;
  importRun: ImportRunFn<IS, OS>;
};

export type TaskInput<T> = T extends InputSchema
  ? z.input<T>
  : T extends TaskDefinition<infer IS, infer _OS>
    ? TaskInput<IS>
    : T extends UseTaskResult<infer IS, infer _OS>
      ? TaskInput<IS>
      : T extends RunFn<infer IS, infer _OS>
        ? TaskInput<IS>
        : T extends ImportRunFn<infer IS, infer _OS>
          ? TaskInput<IS>
          : T extends UseTaskResult<infer IS, infer _OS>['run']
            ? TaskInput<IS>
            : T extends UseTaskResult<infer IS, infer _OS>['importRun']
              ? TaskInput<IS>
              : never;

export type TaskOutput<T> = T extends OutputSchema
  ? z.output<T>
  : T extends TaskDefinition<infer _IS, infer OS>
    ? TaskOutput<OS>
    : T extends UseTaskResult<infer _IS, infer OS>
      ? TaskOutput<OS>
      : T extends RunFn<infer _IS, infer OS>
        ? TaskOutput<OS>
        : T extends ImportRunFn<infer _IS, infer OS>
          ? TaskOutput<OS>
          : T extends UseTaskResult<infer _IS, infer OS>['run']
            ? TaskOutput<OS>
            : T extends UseTaskResult<infer _IS, infer OS>['importRun']
              ? TaskOutput<OS>
              : never;
