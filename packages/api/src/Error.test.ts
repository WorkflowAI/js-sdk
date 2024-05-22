import { WorkflowAIApiRequestError } from './Error'

describe('WorkflowAIApiRequestError', () => {
  test('should create a new instance with response and detail', () => {
    const response = new Response()
    const detail = { message: 'Error details' }
    const error = new WorkflowAIApiRequestError(response, detail)

    expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
    expect(error.response).toBe(response)
    expect(error.detail).toBe(detail)
  })

  test('should create a new instance with response only', () => {
    const response = new Response()
    const error = new WorkflowAIApiRequestError(response)

    expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
    expect(error.response).toBe(response)
    expect(error.detail).toBeUndefined()
  })

  test('should have the correct URL and status', () => {
    const response = new Response(null, { status: 500 })
    const status = 500
    const error = new WorkflowAIApiRequestError(response)

    expect(error.status).toBe(status)
  })
})
