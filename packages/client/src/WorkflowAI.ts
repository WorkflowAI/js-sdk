import { Api, initApi, TaskRunGroup } from './api'
import type {
  ExecutableTask,
  InputSchema,
  OutputSchema,
  TaskDefinition,
  TaskOutput,
} from './Task'

export interface WorkflowAIConfig {
  apiKey?: string
}

export interface RunTaskOptions {
  group: TaskRunGroup
}

export class WorkflowAI {
  protected api: Api

  constructor(config?: WorkflowAIConfig) {
    // Default to env variable
    this.api = initApi({
      apiKey: config?.apiKey || process.env.WORKFLOWAI_API_KEY
    })
  }

  protected async runTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    input: IS,
    options: RunTaskOptions,
  ): Promise<TaskOutput<OS>> {
    const {
      data
    } = await this.api.tasks.run({
      task_id: taskDef.taskId,
      task_schema_id: taskDef.schema.id,
      task_input: taskDef.schema.input.parse(input),
      group: options.group,
    })

    return taskDef.schema.output.parse(data.task_output)
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
