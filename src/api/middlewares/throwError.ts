import { WorkflowAIApiRequestError } from '../Error.js';
import { extractError } from '../ErrorResponse.js';

function parseOrThrow(res: Response, txt: string): unknown {
  try {
    return JSON.parse(txt);
  } catch (_: unknown) {
    throw new WorkflowAIApiRequestError(res, {
      error: {
        message: txt,
        status_code: res.status,
      },
    });
  }
}

/**
 * Middleware function that throws a WorkflowAIApiRequestError if the response is not ok.
 * @param res - The response object.
 * @returns The response object.
 */
export const throwError = {
  async onResponse(res: Response) {
    if (!res.ok) {
      const txt = await res.text();
      const errorBody = parseOrThrow(res, txt);
      throw new WorkflowAIApiRequestError(res, extractError(errorBody));
    }
    return res;
  },
};
