import {
  initWorkflowAIApi,
  InitWorkflowAIApiConfig,
  TaskSchemaRunGroup,
  WorkflowAIApi,
} from '@workflowai/api'

import type {
  ExecutableTask,
  InputSchema,
  OutputSchema,
  TaskDefinition,
  TaskOutput,
} from './Task'

export type WorkflowAIConfig = {
  api?: WorkflowAIApi | InitWorkflowAIApiConfig
}

export interface RunTaskOptions {
  group: TaskSchemaRunGroup
}

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

  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunTaskOptions,
  ): Promise<TaskOutput<OS>> {
    const { data } = await this.api.tasks.schemas.run({
      task_id: taskDef.taskId.toLowerCase(),
      task_schema_id: taskDef.schema.id,
      task_input: await taskDef.schema.input.parseAsync(input),
      group: options.group,
    })

    return taskDef.schema.output.parseAsync(data.task_output)
  }

  public async compileTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    defaultOptions?: Partial<RunTaskOptions>,
  ): Promise<ExecutableTask<IS, OS>> {
    // TODO: register task

    return (input, overrideOptions) => {
      const options = {
        ...defaultOptions,
        ...overrideOptions,
      } as RunTaskOptions

      return this.runTask<IS, OS>(taskDef, input, options)
    }
  }
}
