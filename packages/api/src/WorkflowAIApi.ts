import { Fetcher, Middleware } from 'openapi-typescript-fetch'

import { paths } from '../generated/openapi'
import { getEnv } from './getEnv'

export interface InitWorkflowAIApiConfig {
  apiKey?: string | undefined
  apiUrl?: string | undefined
  use?: Middleware[]
}

export function initWorkflowAIApi(
  config?: InitWorkflowAIApiConfig | undefined,
) {
  const { apiKey, apiUrl, use } = {
    apiKey: getEnv('WORKFLOWAI_API_KEY'),
    apiUrl: getEnv('WORKFLOWAI_API_URL') || 'https://api.workflowai.ai',
    ...config,
  }

  const fetcher = Fetcher.for<paths>()

  // global configuration
  fetcher.configure({
    baseUrl: apiUrl,
    init: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
    use,
  })

  return {
    models: {
      list: fetcher.path('/models').method('get').create(),
    },
    examples: {
      get: fetcher.path('/examples/{example_id}').method('get').create(),
      delete: fetcher.path('/examples/{example_id}').method('delete').create(),
    },
    runs: {
      get: fetcher.path('/runs/{run_id}').method('get').create(),
      annotate: fetcher.path('/runs/{run_id}/annotate').method('post').create(),
    },
    tasks: {
      generate: fetcher.path('/tasks/generate').method('post').create(),
      list: fetcher.path('/tasks').method('get').create(),
      upsert: fetcher.path('/tasks').method('post').create(),
    },
    taskSchemas: {
      run: fetcher
        .path('/tasks/{task_id}/schemas/{task_schema_id}/run')
        .method('post')
        .create(),
    },
  }
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>
