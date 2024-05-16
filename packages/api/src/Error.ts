export class WorkflowAIApiRequestError extends Error {
  /**
   * Request url
   */
  url: string
  /**
   * HTTP response status code
   */
  status: number
  /**
   * Error responses might include JSON in body with error details
   */
  detail: unknown
  response: Response

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
