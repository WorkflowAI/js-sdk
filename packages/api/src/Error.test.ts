import { WorkflowAIApiRequestError } from './Error.js'
import { extractError, WorkflowAIApiError } from './ErrorResponse.js'

describe('WorkflowAIApiRequestError', () => {
  test('should create a new instance with response and detail', () => {
    const response = new Response()
    const detail = extractError({ message: 'Error details' })
    const error = new WorkflowAIApiRequestError(response, detail)

    expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
    expect(error.response).toBe(response)
    expect(error.detail).toBe(detail)
  })

  test('should create a new instance with response only', () => {
    const response = new Response()
    const error = new WorkflowAIApiRequestError(
      response,
      {} as WorkflowAIApiError,
    )

    expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
    expect(error.response).toBe(response)
    expect(error.detail).toEqual({})
  })

  test('should have the correct URL and status', () => {
    const response = new Response(null, { status: 500 })
    const status = 500
    const error = new WorkflowAIApiRequestError(
      response,
      {} as WorkflowAIApiError,
    )

    expect(error.status).toBe(status)
  })
})
