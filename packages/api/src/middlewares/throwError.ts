import type { Middleware } from 'openapi-fetch'

import { WorkflowAIApiRequestError } from '../Error'

/**
 * Throw custom error if response fails
 */
export const throwError: Middleware = {
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
