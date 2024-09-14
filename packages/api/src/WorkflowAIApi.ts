import { createJsonClient, createStreamClient } from './http-clients.js'
import type { FetchOptions } from './index.js'
import { Middleware, throwError } from './middlewares/index.js'
import { getEnv } from './utils/getEnv.js'
import { withStream } from './utils/withStream.js'

export type InitWorkflowAIApiConfig = {
  key?: string | undefined
  url?: string | undefined
  use?: Middleware[]
  fetch?: FetchOptions
}

export function initWorkflowAIApi(
  config?: InitWorkflowAIApiConfig | undefined,
) {
  const {
    key,
    url,
    use: middlewares = [],
    fetch,
  } = {
    key: getEnv('WORKFLOWAI_API_KEY'),
    url: getEnv('WORKFLOWAI_API_URL') || 'https://api.workflowai.ai',
    ...config,
  }

  const addCustomHeaders: Middleware = {
    onRequest: (req) => {
      req.headers.set('x-workflowai-source', 'sdk');
      req.headers.set('x-workflowai-language', 'typescript');
      req.headers.set('x-workflowai-version', '0.1.0');
      return req;
    }
  };

  middlewares.unshift(addCustomHeaders);
  // Add error handing middleware AT THE END of the chain
  middlewares.push(throwError)

  const json = createJsonClient({ url, key, use: middlewares, fetch })
  const stream = createStreamClient({ url, key, use: middlewares, fetch })

  return {
    examples: {
      get: json.GET('/examples/{example_id}'),
      delete: json.DELETE('/examples/{example_id}'),
    },

    models: {
      list: json.GET('/models'),
    },

    runs: {
      get: json.GET('/runs/{run_id}'),
      ratings: {
        create: json.POST('/runs/{run_id}/ratings'),
        update: json.PATCH('/runs/{run_id}/ratings/{score_id}'),
        delete: json.DELETE('/runs/{run_id}/ratings/{score_id}'),
      },
      examples: {
        create: json.POST('/runs/{run_id}/examples'),
      },
    },

    tasks: {
      generate: json.POST('/tasks/generate'),
      list: json.GET('/tasks'),
      upsert: json.POST('/tasks'),

      schemas: {
        create: json.POST('/tasks/{task_id}/schemas'),
        get: json.GET('/tasks/{task_id}/schemas/{task_schema_id}'),
        generateInput: json.POST(
          '/tasks/{task_id}/schemas/{task_schema_id}/input',
        ),
        getPythonCode: json.GET(
          '/tasks/{task_id}/schemas/{task_schema_id}/python',
        ),
        iterate: json.POST('/tasks/schemas/iterate'),
        run: withStream(
          json.POST('/tasks/{task_id}/schemas/{task_schema_id}/run'),
          stream.POST('/tasks/{task_id}/schemas/{task_schema_id}/run'),
        ),

        groups: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/groups'),
          create: json.POST('/tasks/{task_id}/schemas/{task_schema_id}/groups'),
          get: json.GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/groups/{group_id}',
          ),
          update: json.PATCH(
            '/tasks/{task_id}/schemas/{task_schema_id}/groups/{group_id}',
          ),
        },

        runs: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
          import: json.POST('/tasks/{task_id}/schemas/{task_schema_id}/runs'),
        },

        examples: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/examples'),
          create: json.POST(
            '/tasks/{task_id}/schemas/{task_schema_id}/examples',
          ),
        },

        benchmarks: {
          list: json.GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/benchmarks',
          ),
        },

        datasets: {
          list: json.GET('/tasks/{task_id}/schemas/{task_schema_id}/datasets'),
          examples: {
            list: json.GET(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/examples',
            ),
          },
          inputs: {
            list: json.GET(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/inputs',
            ),
          },
          runs: {
            list: json.GET(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/runs',
            ),
          },
          groups: {
            list: json.GET(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/groups',
            ),
            get: json.GET(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/groups/{group_id}',
            ),
          },
          benchmarks: {
            create: json.POST(
              '/tasks/{task_id}/schemas/{task_schema_id}/datasets/{dataset_id}/benchmarks',
            ),
          },
        },

        evaluators: {
          list: json.GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators',
          ),
          create: json.POST(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators',
          ),
          generateInstructions: json.POST(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators/suggested-instructions',
          ),
          generateFieldEvaluations: json.POST(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators/suggested-field-evaluations',
          ),
          get: json.GET(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators/{evaluator_id}',
          ),
          delete: json.DELETE(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators/{evaluator_id}',
          ),
          replace: json.PUT(
            '/tasks/{task_id}/schemas/{task_schema_id}/evaluators/{evaluator_id}',
          ),
        },
      },
    },

    benchmarks: {
      get: json.GET('/benchmarks/{benchmark_id}'),
    },

    organization: {
      settings: {
        get: json.GET('/organization/settings'),
        providers: {
          getSchemas: json.GET('/organization/settings/providers/schemas'),
          create: json.POST('/organization/settings/providers'),
          delete: json.DELETE('/organization/settings/providers/{provider_id}'),
        },
      },
    },
  }
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>
