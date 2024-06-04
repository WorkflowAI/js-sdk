import {
  initWorkflowAIApi,
  InitWorkflowAIApiConfig,
  Schemas,
  type WorkflowAIApi,
  WorkflowAIApiRequestError,
  wrapAsyncIterator,
} from '@workflowai/api'
import { inputZodToSchema, outputZodToSchema, z } from '@workflowai/schema'

import {
  hasSchemaId,
  type InputSchema,
  type OutputSchema,
  type TaskDefinition,
  type TaskRunResult,
  type TaskRunStreamEvent,
  type TaskRunStreamResult,
  type UseTaskResult,
} from './Task'

export type WorkflowAIConfig = {
  api?: WorkflowAIApi | InitWorkflowAIApiConfig
}

export type RunTaskOptions<Stream extends true | false = false> = {
  group: Schemas['RunRequest']['group']
  stream?: Stream
}

export type ImportTaskRunOptions = Pick<
  Parameters<WorkflowAIApi['tasks']['schemas']['runs']['import']>[0]['body'],
  'id' | 'group' | 'start_time' | 'end_time' | 'labels'
>

export class WorkflowAI {
  protected api: WorkflowAIApi

  constructor(config?: WorkflowAIConfig) {
    const { api: apiConfig } = {
      ...config,
    }

    if (apiConfig && 'tasks' in apiConfig) {
      this.api = apiConfig
    } else {
      this.api = initWorkflowAIApi({
        ...apiConfig,
      })
    }
  }

  protected async upsertTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS, true>,
  ): Promise<TaskDefinition<IS, OS, false>> {
    const { data, error, response } = await this.api.tasks.upsert({
      body: {
        task_id: taskDef.taskId,
        name: taskDef.taskName || taskDef.taskId,
        // @ts-expect-error The generated API types are messed up
        input_schema: await inputZodToSchema(taskDef.schema.input),
        // @ts-expect-error The generated API types are messed up
        output_schema: await outputZodToSchema(taskDef.schema.output),
      },
    })

    if (!data) {
      throw new WorkflowAIApiRequestError(response, error)
    }

    return {
      ...taskDef,
      taskId: data.task_id!,
      taskName: data.name,
      schema: {
        ...taskDef.schema,
        id: data.task_schema_id!,
      },
    }
  }

  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS, false>,
    input: IS,
    options: RunTaskOptions<false>,
  ): Promise<TaskRunResult<OS>>
  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS, false>,
    input: IS,
    options: RunTaskOptions<true>,
  ): Promise<TaskRunStreamResult<OS>>
  protected async runTask<
    IS extends InputSchema,
    OS extends OutputSchema,
    S extends true | false = false,
  >(
    taskDef: TaskDefinition<IS, OS, false>,
    input: IS,
    { group, stream }: RunTaskOptions<S>,
  ) {
    const init = {
      params: {
        path: {
          task_id: taskDef.taskId.toLowerCase(),
          task_schema_id: taskDef.schema.id,
        },
      },
      body: {
        task_input: await taskDef.schema.input.parseAsync(input),
        group,
        stream,
      },
    }

    // Prepare a run call, but nothing is executed yet
    const run = this.api.tasks.schemas.run(init)

    if (stream) {
      // Streaming response, we receive partial results

      const { response, stream: rawStream } = await run.stream()

      return {
        response,
        // Return an async iterator for easy consumption
        stream: wrapAsyncIterator(
          rawStream,
          // Transform the server-sent events data to the expected outputs
          // conforming to the schema (as best as possible)
          async ({ data }): Promise<TaskRunStreamEvent<OS>> => {
            // Allows us to make a deep partial version of the schema, whatever the schema looks like
            const partialWrap = z.object({ partial: taskDef.schema.output })
            const [parsed, partialParsed] = await Promise.all([
              // We do a `safeParse` to avoid throwing, since it's expected that during
              // streaming of partial results we'll have data that does not conform to schema
              data && taskDef.schema.output.safeParseAsync(data.task_output),
              data &&
                (
                  partialWrap.deepPartial() as typeof partialWrap
                ).safeParseAsync({
                  partial: data.task_output,
                }),
            ])

            return {
              data,
              output: parsed?.data,
              partialOutput: partialParsed?.data?.partial,
            }
          },
        ),
      }
    } else {
      // Non-streaming version, await the run to actually send the request
      const { data, error, response } = await run
      if (!data) {
        throw new WorkflowAIApiRequestError(response, error)
      }

      return {
        data,
        response,
        output: await taskDef.schema.output.parseAsync(data.task_output),
      } as TaskRunResult<OS>
    }
  }

  protected async importTaskRun<
    IS extends InputSchema,
    OS extends OutputSchema,
  >(
    taskDef: TaskDefinition<IS, OS, false>,
    input: IS,
    output: OS,
    options: ImportTaskRunOptions,
  ) {
    const [task_input, task_output] = await Promise.all([
      taskDef.schema.input.parseAsync(input),
      taskDef.schema.output.parseAsync(output),
    ])

    const { data, response, error } = await this.api.tasks.schemas.runs.import({
      params: {
        path: {
          task_id: taskDef.taskId.toLowerCase(),
          task_schema_id: taskDef.schema.id,
        },
      },
      body: {
        ...options,
        task_input,
        task_output,
      },
    })

    if (!data) {
      throw new WorkflowAIApiRequestError(response, error)
    }

    return { data, response }
  }

  public async useTask<IS extends InputSchema, OS extends OutputSchema>(
    _taskDef: TaskDefinition<IS, OS, true>,
    defaultOptions?: Partial<RunTaskOptions>,
  ): Promise<UseTaskResult<IS, OS>> {
    let taskDef: TaskDefinition<IS, OS>

    // Make sure we have a schema ID, either passed or by upserting the task
    if (hasSchemaId(_taskDef)) {
      taskDef = _taskDef
    } else if (_taskDef.taskName) {
      taskDef = await this.upsertTask(_taskDef)
    } else {
      throw new Error(
        'Invalid task definition to compile: missing task schema id or task name',
      )
    }

    const run: UseTaskResult<IS, OS>['run'] = (input, overrideOptions) => {
      const options = {
        ...defaultOptions,
        ...overrideOptions,
      } as RunTaskOptions

      let runPromise: Promise<TaskRunResult<OS>>

      const getRunPromise = () => {
        if (!runPromise) {
          runPromise = this.runTask<IS, OS>(taskDef, input, {
            ...options,
            stream: false,
          })
        }
        return runPromise
      }

      return {
        get [Symbol.toStringTag]() {
          return Promise.resolve()[Symbol.toStringTag]
        },
        then: (...r) => getRunPromise().then(...r),
        catch: (...r) => getRunPromise().catch(...r),
        finally: (...r) => getRunPromise().finally(...r),
        stream: () =>
          this.runTask<IS, OS>(taskDef, input, {
            ...options,
            stream: true,
          }),
      }
    }

    const importRun: UseTaskResult<IS, OS>['importRun'] = async (
      input,
      output,
      overrideOptions,
    ) => {
      return this.importTaskRun(taskDef, input, output, {
        ...defaultOptions,
        ...overrideOptions,
        group: {
          ...defaultOptions?.group,
          ...overrideOptions?.group,
          properties: {
            ...defaultOptions?.group?.properties,
            ...overrideOptions?.group?.properties,
          },
        },
      })
    }

    return {
      run,
      importRun,
    }
  }
}
