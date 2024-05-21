import { MergedOptions } from 'openapi-fetch'

import { WorkflowAIApiRequestError } from '../Error'
import { throwError } from './throwError'

describe('throwError middleware', () => {
  it('should have onResponse defined', () => {
    expect(throwError.onResponse).toBeDefined()
  })

  it('should throw WorkflowAIApiRequestError if response is 500', async () => {
    const response = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(
      throwError.onResponse?.(response, {} as MergedOptions),
    ).rejects.toThrow(WorkflowAIApiRequestError)
  })

  it('should not throw WorkflowAIApiRequestError if response status is 200', async () => {
    const response = new Response(null, { status: 200, statusText: 'OK' })

    await expect(
      throwError.onResponse?.(response, {} as MergedOptions),
    ).resolves.not.toThrow(WorkflowAIApiRequestError)
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
      await throwError.onResponse?.(response, {} as MergedOptions)
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
      expect(error.message).toBe(
        `Failed to request ${response.url}: {"message":"Something went wrong"}`,
      )
      expect(error.detail).toEqual({ message: 'Something went wrong' })
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
      await throwError.onResponse?.(response, {} as MergedOptions)
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(error).toBeInstanceOf(WorkflowAIApiRequestError)
      expect(error.message).toBe(`Failed to request ${response.url}`)
      expect(error.detail).toBeUndefined()
      expect(error.url).toBe(response.url)
      expect(error.status).toBe(response.status)
      expect(error.response).toBe(response)
    }
  })
})
