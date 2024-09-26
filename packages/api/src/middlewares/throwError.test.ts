import { WorkflowAIApiRequestError } from '../Error.js'
import { throwError } from './throwError.js'

describe('throwError middleware', () => {
  it('should have onResponse defined', () => {
    expect(throwError.onResponse).toBeDefined()
  })

  it('should throw WorkflowAIApiRequestError if response is 500', async () => {
    const response = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(throwError.onResponse?.(response)).rejects.toThrow(
      WorkflowAIApiRequestError,
    )
  })

  it('should not throw WorkflowAIApiRequestError if response status is 200', async () => {
    const response = new Response(null, { status: 200, statusText: 'OK' })

    await expect(throwError.onResponse?.(response)).resolves.not.toThrow(
      WorkflowAIApiRequestError,
    )
  })

  it('should throw WorkflowAIApiRequestError with correct error message', async () => {
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
      },
    )

    try {
      await throwError.onResponse?.(response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
      expect(error.message).toBe(
        `Failed to request ${response.url}: {
  "error": {
    "details": {
      "message": "Something went wrong"
    }
  }
}`,
      )
      expect(error.url).toBe(response.url)
      expect(error.status).toBe(response.status)
      expect(error.response).toBe(response)
    }
  })

  it('should throw WorkflowAIApiRequestError with correct error message for run errors', async () => {
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
        statusText:
          "Received invalid JSON: at [icd10_code], 'I10' is not one of ['Z83.7', 'Z83.49', 'Z83.438', 'Z83.42', 'Z82.49', 'Z82.41']",
        headers: { 'Content-Type': 'application/json' },
      },
    )

    try {
      await throwError.onResponse?.(response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
      expect(error.message).toBe(
        `Failed to request ${response.url}: {
  "error": {
    "details": {
      "provider_status_code": 200,
      "provider_error": null,
      "provider_options": {
        "model": "claude-3-haiku-20240307",
        "temperature": 0.1,
        "timeout": 180.2
      },
      "provider": null
    },
    "message": "Received invalid JSON: at [icd10_code], 'I10' is not one of ['Z83.7', 'Z83.49', 'Z83.438', 'Z83.42', 'Z82.49', 'Z82.41']",
    "status_code": 400,
    "code": "invalid_generation"
  },
  "task_run_id": "5f96bd10-0538-4849-802e-47f8d5c4d48f"
}`,
      )
      expect(error.url).toBe(response.url)
      expect(error.status).toBe(response.status)
      expect(error.response).toBe(response)
    }
  })

  it('should throw WorkflowAIApiRequestError with no error message if body is invalid', async () => {
    const response = new Response(
      `{
      "detail": krakboom,
    }`,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      },
    )
    try {
      await throwError.onResponse?.(response)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
      expect(error.message).toBe(`Failed to request ${response.url}: {
  "error": {
    "message": "Failed to parse response",
    "status_code": 500
  }
}`)
      expect(error.url).toBe(response.url)
      expect(error.status).toBe(response.status)
      expect(error.response).toBe(response)
    }
  })
})
