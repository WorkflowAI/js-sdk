import { Fetcher, Middleware } from 'openapi-typescript-fetch'

import { paths } from './generated/openapi'
import { getEnv } from './getEnv'

export type InitWorkflowAIApiConfig = {
  key?: string | undefined
  url?: string | undefined
  use?: Middleware[]
}

export function initWorkflowAIApi(
  config?: InitWorkflowAIApiConfig | undefined,
) {
  const { key, url, use } = {
    key: getEnv('WORKFLOWAI_API_KEY'),
    url: getEnv('WORKFLOWAI_API_URL') || 'https://api.workflowai.ai',
    ...config,
  }

  const fetcher = Fetcher.for<paths>()

  // Default configuration
  fetcher.configure({
    baseUrl: url,
    init: {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    },
    use,
  })

  return {
    tasks: {
      generate: fetcher.path('/tasks/generate').method('post').create(),
      list: fetcher.path('/tasks').method('get').create(),
      upsert: fetcher.path('/tasks').method('post').create(),

      groups: {
        get: fetcher
          .path('/tasks/{task_id}/groups/{group_id}')
          .method('get')
          .create(),
      },

      schemas: {
        get: fetcher
          .path('/tasks/{task_id}/schemas/{task_schema_id}')
          .method('get')
          .create(),
        run: fetcher
          .path('/tasks/{task_id}/schemas/{task_schema_id}/run')
          .method('post')
          .create(),

        runs: {
          list: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/runs')
            .method('get')
            .create(),
          import: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/runs')
            .method('post')
            .create(),
          aggregate: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/runs/aggregate')
            .method('get')
            .create(),
        },

        examples: {
          list: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/examples')
            .method('get')
            .create(),
          create: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/examples')
            .method('post')
            .create(),
        },

        scores: {
          list: fetcher
            .path('/tasks/{task_id}/schemas/{task_schema_id}/scores')
            .method('get')
            .create(),
        },
      },
    },

    runs: {
      get: fetcher.path('/runs/{run_id}').method('get').create(),
      annotate: fetcher.path('/runs/{run_id}/annotate').method('post').create(),
    },

    models: {
      list: fetcher.path('/models').method('get').create(),
    },

    examples: {
      get: fetcher.path('/examples/{example_id}').method('get').create(),
      delete: fetcher.path('/examples/{example_id}').method('delete').create(),
    },
  }
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>
