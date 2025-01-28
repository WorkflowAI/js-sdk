import { createJsonClient, createStreamClient } from './http-clients.js';
import {
  Middleware,
  customHeaders,
  throwError,
} from './middlewares/customHeaders.js';
import { FetchOptions } from './types.js';
import { getEnv } from './utils/getEnv.js';
import { withStream } from './utils/withStream.js';

export type InitWorkflowAIApiConfig = {
  key?: string | undefined;
  url?: string | undefined;
  use?: Middleware[];
  fetch?: FetchOptions;
};

export function initWorkflowAIApi(
  config?: InitWorkflowAIApiConfig | undefined
) {
  const {
    key,
    url,
    use: middlewares = [],
    fetch,
  } = {
    key: getEnv('WORKFLOWAI_API_KEY'),
    url: getEnv('WORKFLOWAI_API_URL') || 'https://run.workflowai.com',
    ...config,
  };

  middlewares.unshift(customHeaders);
  // Add error handing middleware AT THE END of the chain
  middlewares.push(throwError);

  const json = createJsonClient({ url, key, use: middlewares, fetch });
  const stream = createStreamClient({ url, key, use: middlewares, fetch });

  return {
    agents: {
      schemas: {
        run: withStream(
          json.POST(
            '/v1/{tenant}/agents/{task_id}/schemas/{task_schema_id}/run'
          ),
          stream.POST(
            '/v1/{tenant}/agents/{task_id}/schemas/{task_schema_id}/run'
          )
        ),
      },
    },
  };
}

export type WorkflowAIApi = ReturnType<typeof initWorkflowAIApi>;
