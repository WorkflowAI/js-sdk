import createClient, { MaybeOptionalInit, Middleware } from 'openapi-fetch'
import type { PathsWithMethod } from 'openapi-typescript-helpers'

import { WorkflowAIApiRequestError } from './Error'
import type { paths } from './generated/openapi'
import { getEnv } from './getEnv'

const THROW_ERROR_MIDDLEWARE: Middleware = {
  async onResponse(res) {
    if (!res.ok) {
      let detail: unknown
      try {
        detail = (await res.json())?.detail
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        throw new WorkflowAIApiRequestError(res, detail)
      }
    }
    return res
  },
}

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
    use: middlewares,
  } = {
    key: getEnv('WORKFLOWAI_API_KEY'),
    url: getEnv('WORKFLOWAI_API_URL') || 'https://api.workflowai.ai',
    ...config,
  }

  const fetcher = createClient<paths>({
    baseUrl: url,
    headers: {
      Authorization: `Bearer ${key}`,
    },
  })

  // Register middlewares
  if (middlewares?.length) {
    fetcher.use(...middlewares)
  }

  // Register error AFTER other middlewares
  fetcher.use(THROW_ERROR_MIDDLEWARE)

  const GET =
    <P extends PathsWithMethod<paths, 'get'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'get'>) =>
      fetcher.GET(path, init)

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'post'>) =>
      fetcher.POST(path, init)

  const DELETE =
    <P extends PathsWithMethod<paths, 'delete'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'delete'>) =>
      fetcher.DELETE(path, init)

  return {
    tasks: {
      generate: POST('/tasks/generate'),
      list: GET('/tasks'),
      upsert: POST('/tasks'),

      groups: {
        get: GET('/tasks/{task_id}/groups/{group_id}'),
      },

      schemas: {
        get: GET('/tasks/{task_id}/schemas/{task_schema_id}'),
        run: POST('/tasks/{task_id}/schemas/{task_schema_id}/run'),

        runs: {
          list: GET('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
          import: POST('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
          aggregate: GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/runs/aggregate',
          ),
        },

        examples: {
          list: GET('/tasks/{task_id}/schemas/{task_schema_id}/examples'),
          create: POST('/tasks/{task_id}/schemas/{task_schema_id}/examples'),
        },

        scores: {
          list: GET('/tasks/{task_id}/schemas/{task_schema_id}/scores'),
        },
      },
    },

    runs: {
      get: GET('/runs/{run_id}'),
      annotate: POST('/runs/{run_id}/annotate'),
    },

    models: {
      list: GET('/models'),
    },

    examples: {
      get: GET('/examples/{example_id}'),
      delete: DELETE('/examples/{example_id}'),
    },
  }
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>
