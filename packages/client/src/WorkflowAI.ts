import {
  initWorkflowAIApi,
  InitWorkflowAIApiConfig,
  TaskSchemaRunGroup,
  WorkflowAIApi,
  WorkflowAIApiRequestError,
} from '@workflowai/api'
import { inputZodToSchema, outputZodToSchema } from '@workflowai/schema'

import {
  type ExecutableTask,
  hasSchemaId,
  type InputSchema,
  type OutputSchema,
  type TaskDefinition,
  type TaskOutput,
} from './Task'

export type WorkflowAIConfig = {
  api?: WorkflowAIApi | InitWorkflowAIApiConfig
}

export interface RunTaskOptions {
  group: TaskSchemaRunGroup
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
    options: RunTaskOptions,
  ): Promise<TaskOutput<OS>> {
    const { data, error, response } = await this.api.tasks.schemas.run({
      params: {
        path: {
          task_id: taskDef.taskId.toLowerCase(),
          task_schema_id: taskDef.schema.id,
        },
      },
      body: {
        task_input: await taskDef.schema.input.parseAsync(input),
        group: options.group,
      },
    })

    if (!data) {
      throw new WorkflowAIApiRequestError(response, error)
    }

    return taskDef.schema.output.parseAsync(data.task_output)
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

    return data
  }

  public async compileTask<IS extends InputSchema, OS extends OutputSchema>(
    _taskDef: TaskDefinition<IS, OS, true>,
    defaultOptions?: Partial<RunTaskOptions>,
  ): Promise<ExecutableTask<IS, OS>> {
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

    const runTask: ExecutableTask<IS, OS> = (input, overrideOptions) => {
      const options = {
        ...defaultOptions,
        ...overrideOptions,
      } as RunTaskOptions

      return this.runTask<IS, OS>(taskDef, input, options)
    }

    runTask.importRun = async (input, output, overrideOptions) => {
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

    return runTask
  }
}
