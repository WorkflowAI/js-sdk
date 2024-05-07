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
  groupId?: string
}

export class WorkflowAI {
  protected apiKey: string | undefined

  constructor(config?: WorkflowAIConfig) {
    // Default to env variable
    this.apiKey = config?.apiKey || process.env.WORKFLOWAI_API_KEY
  }

  protected runTask<IS extends InputSchema, OS extends OutputSchema>(
    _taskDef: TaskDefinition<IS, OS>,
    _input: IS,
    _options: RunTaskOptions,
  ): Promise<TaskOutput<OS>> {
    return Promise.reject('Not implemented')
  }

  compileTask<IS extends InputSchema, OS extends OutputSchema>(
    taskDef: TaskDefinition<IS, OS>,
    _defaultOptions?: RunTaskOptions,
  ): ExecutableTask<IS, OS> {
    // TODO: register task

    return (input, options) => {
      options = {
        ..._defaultOptions,
        ...options,
      }

      return this.runTask<IS, OS>(taskDef, input, options)
    }
  }
}
