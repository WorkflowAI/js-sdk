import { WorkflowAIApiRequestError } from '../Error.js'
import { WorkflowAIApiError } from '../ErrorResponse.js'
/**
 * Middleware function that throws a WorkflowAIApiRequestError if the response is not ok.
 * @param res - The response object.
 * @returns The response object.
 */
export const throwError = {
  async onResponse(res: Response) {

    
    if (!res.ok) {
      let resError: WorkflowAIApiError
        try {
          const respJson = await res.json()
          try{
            resError = { error: { details: respJson?.error.details, message: respJson?.error.message, status_code: respJson?.error.status_code, code: respJson?.error.code } }
          } catch (e) {
            resError = { error: { details: respJson?.detail } }
        }

        throw new WorkflowAIApiRequestError(res, resError)
      } catch (e) {
        // eslint-disable-next-line no-unsafe-finally
        throw new WorkflowAIApiRequestError(res, { error: { message: String(e) } })
      }
    }
    return res
  },
}
