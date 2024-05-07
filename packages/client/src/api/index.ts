import './fetch-polyfill'

import { Fetcher } from 'openapi-typescript-fetch'

import { components, paths } from './openapi'

export type TaskRunGroup =
  components['schemas']['api__routers__task_schemas__RunRequest__Group']

interface InitApiConfig {
  apiKey: string | undefined
}

export function initApi(config: InitApiConfig) {
  const { apiKey } = config

  const fetcher = Fetcher.for<paths>()

  // global configuration
  fetcher.configure({
    baseUrl: 'https://api.workflowai.ai',
    init: {
      headers: {
        Authorization: `Bearer ${apiKey || ''}`,
      },
    },
    // use: [...] // middlewares
  })

  return {
    tasks: {
      upsert: fetcher.path('/tasks').method('post').create(),
      run: fetcher
        .path('/tasks/{task_id}/schemas/{task_schema_id}/run')
        .method('post')
        .create(),
    },
  }
}

export type Api = ReturnType<typeof initApi>
