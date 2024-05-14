export class WorkflowAIApiRequestError extends Error {
  url: string
  status: number
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
