import { WorkflowAIError } from '../error.js';
import { throwError } from './throwError.js';

describe('throwError middleware', () => {
  it('should have onResponse defined', () => {
    expect(throwError.onResponse).toBeDefined();
  });

  it('should throw WorkflowAIError if response is 500', async () => {
    const response = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(throwError.onResponse?.(response)).rejects.toThrow(
      WorkflowAIError
    );
  });

  it('should not throw WorkflowAIError if response status is 200', async () => {
    const response = new Response(null, { status: 200, statusText: 'OK' });

    await expect(throwError.onResponse?.(response)).resolves.not.toThrow(
      WorkflowAIError
    );
  });

  it('should throw WorkflowAIError with correct error message', async () => {
    const response = new Response(
      JSON.stringify({
        detail: {
          message: 'Something went wrong',
        },
      }),
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    try {
      await throwError.onResponse?.(response);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkflowAIError);
      expect(error.message).toBe(
        `Failed to request ${response.url}: unknown error`
      );
      expect(error.url).toBe(response.url);
      expect(error.status).toBe(response.status);
      expect(error.response).toBe(response);
    }
  });

  it('should throw WorkflowAIError with correct error message for run errors', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          details: {
            provider_status_code: 200,
            provider_error: null,
            provider_options: {
              model: 'claude-3-haiku-20240307',
              temperature: 0.1,
              timeout: 180.2,
            },
            provider: null,
          },
          message:
            "Received invalid JSON: at [icd10_code], 'I10' is not one of ['Z83.7', 'Z83.49', 'Z83.438', 'Z83.42', 'Z82.49', 'Z82.41']",
          status_code: 400,
          code: 'invalid_generation',
        },
        task_run_id: '5f96bd10-0538-4849-802e-47f8d5c4d48f',
      }),
      {
        status: 400,
        statusText: 'Bad request',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    try {
      await throwError.onResponse?.(response);
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(WorkflowAIError);
      if (!(error instanceof WorkflowAIError)) {
        expect(true).toBe(false);
        return;
      }
      expect(error.message).toBe(
        `Failed to request ${response.url}: invalid_generation`
      );
      expect(error.url).toBe(response.url);
      expect(error.status).toBe(response.status);
      expect(error.response).toBe(response);
      expect(error.errorCode).toBe('invalid_generation');
    }
  });

  it('should throw WorkflowAIError with no error message if body is invalid', async () => {
    const response = new Response(`blablabla`, {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
    });
    try {
      await throwError.onResponse?.(response);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkflowAIError);
      expect(error.message).toBe(
        `Failed to request ${response.url}: unknown error`
      );
      expect(error.url).toBe(response.url);
      expect(error.status).toBe(response.status);
      expect(error.response).toBe(response);
    }
  });
});
