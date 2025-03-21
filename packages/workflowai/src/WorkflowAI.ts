import {
  Agent,
  AgentDefinition,
  Input,
  Output,
  RunResult,
  RunStreamEvent,
  RunStreamResult,
} from './agent.js';
import {
  InitWorkflowAIApiConfig,
  type WorkflowAIApi,
  initWorkflowAIApi,
} from './api/api.js';
import { WorkflowAIError } from './api/error.js';
import { extractError } from './api/errorResponse.js';
import type { RunRequest, RunResponse } from './api/types.js';
import { wrapAsyncIterator } from './api/utils/wrapAsyncIterator.js';
import { z } from './schema/zod/zod.js';
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
import { RunOptions } from './types.js';
import { DeepPartial } from './utils.js';

export type WorkflowAIConfig = InitWorkflowAIApiConfig;

function optionsToRunRequest(
  input: Record<string, never>,
  options: Omit<RunOptions<true | false>, 'fetch'>
): RunRequest {
  const { version, stream, metadata, useCache, privateFields } = options;

  return {
    task_input: input,
    version,
    stream,
    metadata,
    use_cache: useCache || 'auto',
    private_fields: privateFields,
  };
}

export class WorkflowAI {
  protected api: WorkflowAIApi;
  protected api_url: string;

  constructor(config?: WorkflowAIConfig | { api: WorkflowAIConfig }) {
    // Old constructors used to be { api: WorkflowAIConfig }
    const c = config && 'api' in config ? config.api : config;
    this.api = initWorkflowAIApi({
      ...(c ?? {}),
    });

    this.api_url = this.api.url.replace('https://run.', 'https://api.');
  }

  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunOptions<false>
  ): Promise<TaskRunResult<OS>>;
  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunOptions<true>
  ): Promise<TaskRunStreamResult<OS>>;
  protected async runTask<
    IS extends InputSchema,
    OS extends OutputSchema,
    S extends true | false = false,
  >(taskDef: TaskDefinition<IS, OS>, input: IS, options: RunOptions<S>) {
    // TODO: surround with try catch to print pretty error
    const validatedInput = await taskDef.schema.input.parseAsync(input);

    const body = optionsToRunRequest(validatedInput, options);
    // Prepare a run call, but nothing is executed yet
    const run = this.api.tasks.schemas.run({
      params: {
        path: {
          tenant: '_',
          task_id: taskDef.taskId.toLowerCase(),
          task_schema_id: taskDef.schema.id,
        },
      },
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

      return {
        data: data as RunResponse,
        response,
        output,
        feedbackToken: data.feedback_token,
      };
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
            feedbackToken: data?.feedback_token as string,
          };
        }
      ),
    };
  }

  public useTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    defaultOptions?: Partial<RunOptions>
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
      } as RunOptions;

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

  protected async runAgent<I extends Input, O extends Output>(
    taskDef: AgentDefinition,
    input: I,
    options: RunOptions<false>
  ): Promise<RunResult<O>>;
  protected async runAgent<I extends Input, O extends Output>(
    taskDef: AgentDefinition,
    input: I,
    options: RunOptions<true>
  ): Promise<RunStreamResult<O>>;
  protected async runAgent<
    I extends Input,
    O extends Output,
    S extends true | false = false,
  >(taskDef: AgentDefinition, input: I, options: RunOptions<S>) {
    const body = optionsToRunRequest(input as Record<string, never>, options);
    // Prepare a run call, but nothing is executed yet
    const run = this.api.tasks.schemas.run({
      params: {
        path: {
          tenant: '_',
          task_id: taskDef.id.toLowerCase(),
          task_schema_id: taskDef.schemaId,
        },
      },
      body,
      ...options.fetch,
    });

    if (!options.stream) {
      const { data, error, response } = await run;
      if (!data) {
        throw new WorkflowAIError(response, extractError(error));
      }

      const output = data.task_output as Output;

      return {
        data: data as RunResponse,
        response,
        output,
        feedbackToken: data.feedback_token,
      };
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
        async ({ data }): Promise<RunStreamEvent<O>> => {
          return {
            data,
            output: data?.task_output as DeepPartial<O>,
            feedbackToken: data?.feedback_token as string,
          };
        }
      ),
    };
  }

  public agent<I extends Input, O extends Output>(
    taskDef: AgentDefinition & Partial<RunOptions>
  ): Agent<I, O> {
    // Make sure we have a schema ID and it's not 0
    if (!taskDef.schemaId || !taskDef.id) {
      throw new Error(
        'Invalid task definition to compile: missing task id or schema id'
      );
    }
    const { id, schemaId, ...defaultOptions } = taskDef;

    const run: Agent<I, O> = (input, overrideOptions) => {
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
          runPromise = this.runAgent<I, O>(taskDef, input, {
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
          this.runAgent<I, O>(taskDef, input, {
            ...options,
            stream: true,
          }),
      };
    };
    return run;
  }

  public async sendFeedback(req: {
    feedbackToken: string;
    outcome: 'positive' | 'negative';
    comment?: string;
    userID?: string;
  }) {
    const { feedbackToken, outcome, comment, userID } = req;
    const body = {
      feedback_token: feedbackToken,
      outcome,
      comment,
      user_id: userID,
    };

    const response = await fetch(`${this.api_url}/v1/feedback`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback');
    }
  }
}
