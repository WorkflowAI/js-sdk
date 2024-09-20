import { WorkflowAIApiRequestError } from '../Error.js'

/**
 * Middleware function that throws a WorkflowAIApiRequestError if the response is not ok.
 * @param res - The response object.
 * @returns The response object.
 */
export const throwError = {
  async onResponse(res: Response) {
    if (!res.ok) {
      let error: unknown
      try {
        const respJson = await res.json()
        error = respJson?.error
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        throw new WorkflowAIApiRequestError(res, error)
      }
    }
    return res
  },
}
