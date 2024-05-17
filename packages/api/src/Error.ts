/**
 * Custom error class for Workflow AI API request errors.
 */
export class WorkflowAIApiRequestError extends Error {
  /**
   * The URL of the failed request.
   */
  url: string
  /**
   * The HTTP response status code of the failed request.
   */
  status: number
  /**
   * Additional error details that might be included in the response body.
   */
  detail: unknown
  /**
   * The original response object of the failed request.
   */
  response: Response

  /**
   * Creates a new WorkflowAIApiRequestError instance.
   * @param response The response object of the failed request.
   * @param detail Additional error details that might be included in the response body.
   */
  constructor(response: Response, detail?: unknown) {
    super(
      `Failed to request ${response.url}${detail ? ': ' + JSON.stringify(detail) : ''}`,
    )

    this.detail = detail
    this.url = response.url
    this.status = response.status
    this.response = response
  }
}
