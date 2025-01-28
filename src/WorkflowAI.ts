import { DeepPartial } from 'utils.js';
import {
  InitWorkflowAIApiConfig,
  type WorkflowAIApi,
  initWorkflowAIApi,
} from './api/api.js';
import { WorkflowAIError } from './api/error.js';
import { extractError } from './api/errorResponse.js';
import {
  FetchOptions,
  RunRequest,
  RunResponse,
  VersionReference,
} from './api/types.js';
import { wrapAsyncIterator } from './api/utils/wrapAsyncIterator.js';
import type {
  RunFn,
  Definition,
  Input,
  Output,
  RunResult,
  RunStreamEvent,
  RunStreamResult,
  AgentResult,
} from './task.js';

export type WorkflowAIConfig = InitWorkflowAIApiConfig;

export type RunOptions<Stream extends true | false = false> = {
  version: VersionReference;
  useCache?: RunRequest['use_cache'];
  metadata?: RunRequest['metadata'];
  stream?: Stream;
  fetch?: FetchOptions;
  privateFields?: ('task_input' | 'task_output' | string)[];
};

function optionsToRunRequest(
  input: Input,
  options: Omit<RunOptions<true | false>, 'fetch'>
): RunRequest {
  const { version, stream, metadata, useCache, privateFields } = options;

  return {
    task_input: input as Record<string, never>,
    version,
    stream,
    metadata,
    use_cache: useCache || 'when_available',
    private_fields: privateFields,
  };
}

function paramsFromTaskDefinition(taskDef: Definition) {
  return {
    path: {
      tenant: '_',
      task_id: taskDef.taskId.toLowerCase(),
      task_schema_id: taskDef.schemaId,
    },
  };
}

export class WorkflowAI {
  protected api: WorkflowAIApi;

  constructor(apiConfig?: WorkflowAIConfig) {
    this.api = initWorkflowAIApi({
      ...apiConfig,
    });
  }

  protected async runTask<I extends Input, O extends Output>(
    taskDef: Definition,
    input: I,
    options: RunOptions<false>
  ): Promise<RunResult<O>>;
  protected async runTask<I extends Input, O extends Output>(
    taskDef: Definition,
    input: I,
    options: RunOptions<true>
  ): Promise<RunStreamResult<O>>;
  protected async runTask<I extends Input, S extends true | false = false>(
    taskDef: Definition,
    input: I,
    options: RunOptions<S>
  ) {
    const body = optionsToRunRequest(input, options);
    // Prepare a run call, but nothing is executed yet
    const run = this.api.agents.schemas.run({
      params: paramsFromTaskDefinition(taskDef),
      body,
      ...options.fetch,
    });

    if (!options.stream) {
      const { data, error, response } = await run;
      if (!data) {
        throw new WorkflowAIError(response, extractError(error));
      }

      const output = data.task_output as Output;

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
        async ({ data }): Promise<RunStreamEvent<Output>> => {
          return {
            data,
            output: data?.task_output as DeepPartial<Output>,
          };
        }
      ),
    };
  }

  // protected async importTaskRun<
  //   IS extends InputSchema,
  //   OS extends OutputSchema,
  // >(
  //   taskDef: Definition<IS, OS>,
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

  public agent<I extends Input, O extends Output>(
    taskDef: Definition & Partial<RunOptions>
  ): AgentResult<I, O> {
    // Make sure we have a schema ID and it's not 0
    if (!taskDef.schemaId) {
      throw new Error(
        'Invalid task definition to compile: missing task schema id or task name'
      );
    }
    const { taskId, schemaId, ...defaultOptions } = taskDef;

    const run: RunFn<I, O> = (input, overrideOptions) => {
      const options = {
        ...defaultOptions,
        ...overrideOptions,
        fetch: {
          ...defaultOptions?.fetch,
          ...overrideOptions?.fetch,
        },
      } as RunOptions;

      let runPromise: Promise<RunResult<O>>;

      const getRunPromise = () => {
        if (!runPromise) {
          runPromise = this.runTask<I, O>(taskDef, input, {
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
          this.runTask<I, O>(taskDef, input, {
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
