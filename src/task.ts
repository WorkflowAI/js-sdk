import { AgentId, RunOptions } from 'types.js';
import type { WorkflowAIApi } from './api/api.js';
import type { RunResponse } from './api/types.js';
import type { z } from './schema/zod/zod.js';
import type { AsyncIteratorValue, DeepPartial } from './utils.js';

export type InputSchema = z.ZodTypeAny;
export type OutputSchema = z.ZodTypeAny;

type TaskSchema<IS extends InputSchema, OS extends OutputSchema> = {
  input: IS;
  output: OS;
  id: number;
};

export type TaskDefinition<IS extends InputSchema, OS extends OutputSchema> = {
  taskId: AgentId;
  schema: TaskSchema<IS, OS>;
};

export type TaskRunResult<OS extends OutputSchema> = {
  data: RunResponse;
  response: Response;
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
  options?: Partial<RunOptions<Stream>>
) => Promise<TaskRunResult<OS>> & {
  stream: () => Promise<TaskRunStreamResult<OS>>;
};

export type UseTaskResult<
  IS extends InputSchema,
  OS extends OutputSchema,
  Stream extends true | false = false,
> = {
  run: RunFn<IS, OS, Stream>;
  // importRun: ImportRunFn<IS, OS>;
};

// Convenience methods to allow doing TaskInput<T> and TaskOutput<T> on a variety of types

export type TaskInput<T> = T extends InputSchema
  ? z.input<T>
  : T extends TaskDefinition<infer IS, infer _OS>
    ? TaskInput<IS>
    : T extends UseTaskResult<infer IS, infer _OS>
      ? TaskInput<IS>
      : T extends RunFn<infer IS, infer _OS>
        ? TaskInput<IS>
        : T extends UseTaskResult<infer IS, infer _OS>['run']
          ? TaskInput<IS>
          : // : T extends UseTaskResult<infer IS, infer _OS>['importRun']
            //   ? TaskInput<IS>
            never;

export type TaskOutput<T> = T extends OutputSchema
  ? z.output<T>
  : T extends TaskDefinition<infer _IS, infer OS>
    ? TaskOutput<OS>
    : T extends UseTaskResult<infer _IS, infer OS>
      ? TaskOutput<OS>
      : T extends RunFn<infer _IS, infer OS>
        ? TaskOutput<OS>
        : T extends UseTaskResult<infer _IS, infer OS>['run']
          ? TaskOutput<OS>
          : // : T extends UseTaskResult<infer _IS, infer OS>['importRun']
            //   ? TaskOutput<OS>
            never;

// export type AgentInput = object;
// export type AgentOutput = object;

// export type TaskDefinition = {
//   taskId: TaskId;
//   schemaId: SchemaId;
// };

// export type TaskRunResult<O extends AgentOutput> = {
//   data: RunResponse;
//   response: Response;
//   output: O;
// };

// // Raw async iterator that the API client returns for streaming a task run
// type RawTaskRunStreamResult = Awaited<
//   ReturnType<
//     Awaited<ReturnType<WorkflowAIApi['tasks']['schemas']['run']>['stream']>
//   >
// >;

// export type TaskRunStreamEvent<O extends AgentOutput> = AsyncIteratorValue<
//   RawTaskRunStreamResult['stream']
// > & {
//   output: DeepPartial<O> | undefined;
// };

// export type TaskRunStreamResult<O extends AgentOutput> = Pick<
//   RawTaskRunStreamResult,
//   'response'
// > & {
//   stream: AsyncIterableIterator<TaskRunStreamEvent<O>>;
// };

// export type RunFn<
//   I extends AgentInput,
//   O extends AgentOutput,
//   Stream extends true | false = false,
// > = (
//   input: I,
//   options?: Partial<RunTaskOptions<Stream>>
// ) => Promise<TaskRunResult<O>> & {
//   stream: () => Promise<TaskRunStreamResult<O>>;
// };

// export type UseTaskResult<
//   I extends AgentInput,
//   O extends AgentOutput,
//   Stream extends true | false = false,
// > = {
//   run: RunFn<I, O, Stream>;
// };

// export type InputSchema = z.ZodTypeAny;
// export type OutputSchema = z.ZodTypeAny;

// // Convenience methods to allow doing TaskInput<T> and TaskOutput<T> on a variety of types

// export type TaskInput<T> = T extends InputSchema
//   ? z.input<T>
//   : T extends TaskDefinition<infer IS, infer _OS>
//     ? TaskInput<IS>
//     : T extends UseTaskResult<infer IS, infer _OS>
//       ? TaskInput<IS>
//       : T extends RunFn<infer IS, infer _OS>
//         ? TaskInput<IS>
//         : T extends UseTaskResult<infer IS, infer _OS>['run']
//           ? TaskInput<IS>
//           : // : T extends UseTaskResult<infer IS, infer _OS>['importRun']
//             //   ? TaskInput<IS>
//             never;

// export type TaskOutput<T> = T extends OutputSchema
//   ? z.output<T>
//   : T extends TaskDefinition<infer _IS, infer OS>
//     ? TaskOutput<OS>
//     : T extends UseTaskResult<infer _IS, infer OS>
//       ? TaskOutput<OS>
//       : T extends RunFn<infer _IS, infer OS>
//         ? TaskOutput<OS>
//         : T extends UseTaskResult<infer _IS, infer OS>['run']
//           ? TaskOutput<OS>
//           : // : T extends UseTaskResult<infer _IS, infer OS>['importRun']
//             //   ? TaskOutput<OS>
//             never;
