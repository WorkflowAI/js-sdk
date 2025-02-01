import { ErrorCode, WorkflowAIApiError } from './errorResponse.js';

/**
 * Custom error class for Workflow AI API request errors.
 */
export class WorkflowAIError extends Error {
  /**
   * The URL of the failed request.
   */
  url: string;
  /**
   * The HTTP response status code of the failed request.
   */
  status: number;
  /**
   * Additional error details that might be included in the response body.
   */
  detail: WorkflowAIApiError | undefined;
  /**
   * The original response object of the failed request.
   */
  response: Response;

  /**
   * A detailed error code.
   */
  errorCode: ErrorCode | undefined;

  /**
   * Creates a new WorkflowAIError instance.
   * @param response The response object of the failed request.
   * @param detail Additional error details that might be included in the response body.
   */
  constructor(response: Response, detail: WorkflowAIApiError | undefined) {
    super(
      `Failed to request ${response.url}: ${detail?.error?.code ?? detail?.error?.details ?? 'unknown error'}`
    );

    this.detail = detail;
    this.url = response.url;
    this.status = response.status;
    this.response = response;
    this.errorCode = detail?.error?.code;
  }
}
