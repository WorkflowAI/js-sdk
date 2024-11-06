import {
  InitWorkflowAIApiConfig,
  type WorkflowAIApi,
  initWorkflowAIApi,
} from '@/api/api.js';
import { WorkflowAIError } from '@/api/error.js';
import { extractError } from '@/api/errorResponse.js';
import {
  FetchOptions,
  RunRequest,
  RunResponse,
  VersionReference,
} from '@/api/types.js';
import { wrapAsyncIterator } from '@/api/utils/wrapAsyncIterator.js';
import { ZodTypeAny, z } from '@/schema/zod/zod.js';
import type {
  InputSchema,
  OutputSchema,
  RunFn,
  TaskDefinition,
  TaskOutput,
  TaskRunResult,
  TaskRunStreamEvent,
  TaskRunStreamResult,
  UseTaskResult,
} from './task.js';

export type WorkflowAIConfig = {
  api?: WorkflowAIApi | InitWorkflowAIApiConfig;
};

export type RunTaskOptions<Stream extends true | false = false> = {
  version: VersionReference;
  useCache?: RunRequest['use_cache'];
  metadata?: RunRequest['metadata'];
  stream?: Stream;
  fetch?: FetchOptions;
  privateFields?: ('task_input' | 'task_output' | string)[];
};

function optionsToRunRequest(
  input: Record<string, never>,
  options: Omit<RunTaskOptions<true | false>, 'fetch'>
): RunRequest {
  const { version, stream, metadata, useCache, privateFields } = options;

  return {
    task_input: input,
    version,
    stream,
    metadata,
    use_cache: useCache || 'when_available',
    private_fields: privateFields,
  };
}

function paramsFromTaskDefinition(
  taskDef: TaskDefinition<ZodTypeAny, ZodTypeAny>
) {
  return {
    path: {
      tenant: '_',
      task_id: taskDef.taskId.toLowerCase(),
      task_schema_id: taskDef.schema.id,
    },
  };
}

export class WorkflowAI {
  protected api: WorkflowAIApi;

  constructor(config?: WorkflowAIConfig) {
    const { api: apiConfig } = {
      ...config,
    };

    if (apiConfig && 'tasks' in apiConfig) {
      this.api = apiConfig;
    } else {
      this.api = initWorkflowAIApi({
        ...apiConfig,
      });
    }
  }

  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunTaskOptions<false>
  ): Promise<TaskRunResult<OS>>;
  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunTaskOptions<true>
  ): Promise<TaskRunStreamResult<OS>>;
  protected async runTask<
    IS extends InputSchema,
    OS extends OutputSchema,
    S extends true | false = false,
  >(taskDef: TaskDefinition<IS, OS>, input: IS, options: RunTaskOptions<S>) {
    // TODO: surround with try catch to print pretty error
    const validatedInput = await taskDef.schema.input.parseAsync(input);

    const body = optionsToRunRequest(validatedInput, options);
    // Prepare a run call, but nothing is executed yet
    const run = this.api.tasks.schemas.run({
      params: paramsFromTaskDefinition(taskDef),
      body,
      ...options.fetch,
    });

    if (!options.stream) {
      const { data, error, response } = await run;
      if (!data) {
        throw new WorkflowAIError(response, extractError(error));
      }

      const output: TaskOutput<OS> = await taskDef.schema.output.parseAsync(
        data.task_output
      );

      return { data: data as RunResponse, response, output };
    }

    // Streaming response, we receive partial results

    const { response, stream: rawStream } = await run.stream();

    return {
      response,
      // Return an async iterator for easy consumption
      stream: wrapAsyncIterator(
        rawStream,
        // Transform the server-sent events data to the expected outputs
        // conforming to the schema (as best as possible)
        async ({ data }): Promise<TaskRunStreamEvent<OS>> => {
          // Allows us to make a deep partial version of the schema, whatever the schema looks like
          const partialWrap = z.object({ partial: taskDef.schema.output });
          const [parsed, partialParsed] = await Promise.all([
            // We do a `safeParse` to avoid throwing, since it's expected that during
            // streaming of partial results we'll have data that does not conform to schema
            data && taskDef.schema.output.safeParseAsync(data.task_output),
            data &&
              (partialWrap.deepPartial() as typeof partialWrap).safeParseAsync({
                partial: data.task_output,
              }),
          ]);

          return {
            data,
            output: parsed?.data,
            partialOutput: partialParsed?.data?.partial,
          };
        }
      ),
    };
  }

  // protected async importTaskRun<
  //   IS extends InputSchema,
  //   OS extends OutputSchema,
  // >(
  //   taskDef: TaskDefinition<IS, OS>,
  //   input: IS,
  //   output: OS,
  //   options: ImportTaskRunOptions
  // ) {
  //   const [task_input, task_output] = await Promise.all([
  //     taskDef.schema.input.parseAsync(input),
  //     taskDef.schema.output.parseAsync(output),
  //   ]);

  //   const { data, response, error } = await this.api.tasks.schemas.runs.import({
  //     params: {
  //       path: {
  //         task_id: taskDef.taskId.toLowerCase(),
  //         task_schema_id: taskDef.schema.id,
  //       },
  //     },
  //     body: {
  //       ...options,
  //       group: sanitizeGroupReference(options.group),
  //       task_input,
  //       task_output,
  //     },
  //   });

  //   if (!data) {
  //     throw new WorkflowAIError(response, extractError(error));
  //   }

  //   return { data, response };
  // }

  public useTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    defaultOptions?: Partial<RunTaskOptions>
  ): UseTaskResult<IS, OS> {
    // Make sure we have a schema ID and it's not 0
    if (!taskDef.schema.id) {
      throw new Error(
        'Invalid task definition to compile: missing task schema id or task name'
      );
    }

    const run: RunFn<IS, OS> = (input, overrideOptions) => {
      const options = {
        ...defaultOptions,
        ...overrideOptions,
        fetch: {
          ...defaultOptions?.fetch,
          ...overrideOptions?.fetch,
        },
      } as RunTaskOptions;

      let runPromise: Promise<TaskRunResult<OS>>;

      const getRunPromise = () => {
        if (!runPromise) {
          runPromise = this.runTask<IS, OS>(taskDef, input, {
            ...options,
            stream: false,
          });
        }
        return runPromise;
      };

      return {
        get [Symbol.toStringTag]() {
          return Promise.resolve()[Symbol.toStringTag];
        },
        then: (...r) => getRunPromise().then(...r),
        catch: (...r) => getRunPromise().catch(...r),
        finally: (...r) => getRunPromise().finally(...r),
        stream: () =>
          this.runTask<IS, OS>(taskDef, input, {
            ...options,
            stream: true,
          }),
      };
    };

    return {
      run,
    };
  }
}
