import { WorkflowAIError } from './error.js';
import { WorkflowAIApiError, extractError } from './errorResponse.js';

describe('WorkflowAIError', () => {
  test('should create a new instance with response and detail', () => {
    const response = new Response();
    const detail = extractError({ message: 'Error details' });
    const error = new WorkflowAIError(response, detail);

    expect(error).toBeInstanceOf(WorkflowAIError);
    expect(error.response).toBe(response);
    expect(error.detail).toBe(detail);
  });

  test('should create a new instance with response only', () => {
    const response = new Response();
    const error = new WorkflowAIError(response, {} as WorkflowAIApiError);

    expect(error).toBeInstanceOf(WorkflowAIError);
    expect(error.response).toBe(response);
    expect(error.detail).toEqual({});
  });

  test('should have the correct URL and status', () => {
    const response = new Response(null, { status: 500 });
    const status = 500;
    const error = new WorkflowAIError(response, {} as WorkflowAIApiError);

    expect(error.status).toBe(status);
  });
});
