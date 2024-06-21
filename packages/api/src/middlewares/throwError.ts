import { WorkflowAIApiRequestError } from '../Error'

/**
 * Middleware function that throws a WorkflowAIApiRequestError if the response is not ok.
 * @param res - The response object.
 * @returns The response object.
 */
export const throwError = {
  async onResponse(res: Response) {
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
