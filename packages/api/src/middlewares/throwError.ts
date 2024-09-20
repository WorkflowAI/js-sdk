import { WorkflowAIApiRequestError } from '../Error.js'
import { extractError } from '../ErrorResponse.js'

/**
 * Middleware function that throws a WorkflowAIApiRequestError if the response is not ok.
 * @param res - The response object.
 * @returns The response object.
 */
export const throwError = {
  async onResponse(res: Response) {
    let resp = {}
    if (!res.ok) {
      try {
        resp = await res.json()
      } catch (_) {
        resp = {
          error: {
            message: 'Failed to parse response',
            status_code: res.status,
          },
        }
      }

      throw new WorkflowAIApiRequestError(res, extractError(resp))
    }
    return res
  },
}
