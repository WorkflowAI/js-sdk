import type { WorkflowAIApi } from '@workflowai/api'
import type { z } from '@workflowai/schema'

import type { AsyncIteratorValue, DeepPartial } from './utils'
import type { ImportTaskRunOptions, RunTaskOptions } from './WorkflowAI'

type TaskId = string
export type InputSchema = z.ZodTypeAny
export type OutputSchema = z.ZodTypeAny

type TaskSchema<
  IS extends InputSchema,
  OS extends OutputSchema,
  OptionalId extends boolean = false,
> = {
  input: IS
  output: OS
} & (OptionalId extends true
  ? { id?: number | null | undefined }
  : { id: number })

export type TaskDefinition<
  IS extends InputSchema,
  OS extends OutputSchema,
  OptionalSchemaId extends boolean = false,
> = {
  taskId: TaskId
  taskName?: string | null | undefined
  schema: TaskSchema<IS, OS, OptionalSchemaId>
}

export function hasSchemaId<IS extends InputSchema, OS extends OutputSchema>(
  taskDef: TaskDefinition<IS, OS, true | false>,
): taskDef is TaskDefinition<IS, OS, false> {
  return taskDef.schema.id != null
}

export type TaskRunResult<OS extends OutputSchema> = Pick<
  Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>>,
  'data' | 'response'
> & {
  output: TaskOutput<OS>
}

// Raw async iterator that the API client returns for streaming a task run
type TaskRunStreamIterator = Awaited<
  ReturnType<
    Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
  >
>

export type TaskRunStreamEvent<OS extends OutputSchema> =
  AsyncIteratorValue<TaskRunStreamIterator> & {
    output: TaskOutput<OS> | undefined
    partialOutput: DeepPartial<TaskOutput<OS>> | undefined
  }

export type ExecutableTask<
  IS extends InputSchema,
  OS extends OutputSchema,
  S extends true | false = false,
> = ((
  input: TaskInput<IS>,
  options?: Partial<RunTaskOptions<S>>,
) => PromiseLike<TaskRunResult<OS>> & {
  stream: () => Promise<AsyncIterableIterator<TaskRunStreamEvent<OS>>>
}) & {
  importRun: (
    input: TaskInput<IS>,
    output: TaskOutput<OS>,
    options?: Partial<ImportTaskRunOptions>,
  ) => Promise<
    Awaited<
      ReturnType<WorkflowAIApi['tasks']['schemas']['runs']['import']>
    >['data']
  >
}

export type TaskInput<T> = T extends InputSchema
  ? z.input<T>
  : T extends TaskDefinition<infer IS, infer _OS>
    ? TaskInput<IS>
    : T extends ExecutableTask<infer IS, infer _OS>
      ? TaskInput<IS>
      : never

export type TaskOutput<T> = T extends OutputSchema
  ? z.output<T>
  : T extends TaskDefinition<infer _IS, infer OS>
    ? TaskOutput<OS>
    : T extends ExecutableTask<infer _IS, infer OS>
      ? TaskOutput<OS>
      : never
