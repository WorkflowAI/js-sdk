import { createJsonClient, createStreamClient } from './http-clients'
import { Middleware, throwError } from './middlewares'
import { getEnv } from './utils/getEnv'
import { withStream } from './utils/withStream'

export type InitWorkflowAIApiConfig = {
  key?: string | undefined
  url?: string | undefined
  use?: Middleware[]
}

export function initWorkflowAIApi(
  config?: InitWorkflowAIApiConfig | undefined,
) {
  const {
    key,
    url,
    use: middlewares = [],
  } = {
    key: getEnv('WORKFLOWAI_API_KEY'),
    url: getEnv('WORKFLOWAI_API_URL') || 'https://api.workflowai.ai',
    ...config,
  }

  // Add error handing middleware AT THE END of the chain
  middlewares.push(throwError)

  const json = createJsonClient({ url, key, use: middlewares })
  const stream = createStreamClient({ url, key, use: middlewares })

  return {
    tasks: {
      generate: json.POST('/tasks/generate'),
      list: json.GET('/tasks'),
      upsert: json.POST('/tasks'),

      groups: {
        get: json.GET('/tasks/{task_id}/groups/{group_id}'),
      },

      schemas: {
        get: json.GET('/tasks/{task_id}/schemas/{task_schema_id}'),
        run: withStream(
          json.POST('/tasks/{task_id}/schemas/{task_schema_id}/run'),
          stream.POST('/tasks/{task_id}/schemas/{task_schema_id}/run'),
        ),

        runs: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
          import: json.POST('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
          aggregate: json.GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/runs/aggregate',
          ),
        },

        examples: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/examples'),
          create: json.POST(
            '/tasks/{task_id}/schemas/{task_schema_id}/examples',
          ),
        },

        scores: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/scores'),
        },
      },
    },

    runs: {
      get: json.GET('/runs/{run_id}'),
      annotate: json.POST('/runs/{run_id}/annotate'),
    },

    models: {
      list: json.GET('/models'),
    },

    examples: {
      get: json.GET('/examples/{example_id}'),
      delete: json.DELETE('/examples/{example_id}'),
    },
  }
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>
