import type { z } from '@workflowai/schema'

import type { RunTaskOptions } from './WorkflowAI'

type TaskId = string
export type InputSchema = z.ZodTypeAny
export type OutputSchema = z.ZodTypeAny

export type TaskDefinition<IS extends InputSchema, OS extends OutputSchema> = {
  taskId: TaskId
  schema: {
    id: number
    input: IS
    output: OS
  }
}

export type ExecutableTask<IS extends InputSchema, OS extends OutputSchema> = (
  input: TaskInput<IS>,
  options?: Partial<RunTaskOptions>,
) => Promise<TaskOutput<OS>>

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
