import { expect, test } from '@jest/globals'
import { z } from 'zod'

import * as createClients from './http-clients.js'
import { Middleware, throwError } from './middlewares/index.js'
import * as getEnv from './utils/getEnv.js'
import { initWorkflowAIApi } from './WorkflowAIApi.js'
// import { onResponse } from 'openapi-fetch'

beforeAll(() => {
  jest.spyOn(createClients, 'createJsonClient')
  jest.spyOn(createClients, 'createStreamClient')
  jest.spyOn(getEnv, 'getEnv')
})

afterEach(() => {
  jest.clearAllMocks()
})

const apiMethod = z
  .function()
  .args(z.record(z.string(), z.any()))
  .returns(
    z.object({
      data: z.any(),
      status: z.any(),
    }),
  )

const headers: Middleware = {
    onRequest: (req) => {
      req.headers.set('x-workflowai-source', 'sdk')
      req.headers.set('x-workflowai-language', 'typescript')
      req.headers.set('x-workflowai-version', '0.1.0')
      return req
    },
  }

describe('WorkflowAIApi', () => {
  test('export api init function', () => {
    expect(initWorkflowAIApi).toBeInstanceOf(Function)
  })

  test('accept empty configuration', () => {
    expect(initWorkflowAIApi()).toBeTruthy()
  })

  test('export api routes as functions', () => {
    const outputSchema = z.record(
      z.string(),
      z.union([
        apiMethod,
        z.record(
          z.string(),
          z.union([
            apiMethod,
            z.record(
              z.string(),
              z.union([
                apiMethod,
                z.record(
                  z.string(),
                  z.union([apiMethod, z.record(z.string(), apiMethod)]),
                ),
              ]),
            ),
          ]),
        ),
      ]),
    )
    const api = initWorkflowAIApi()
    expect(outputSchema.parse(api)).toBeTruthy()
  })

  test('create clients is called with the correct arguments, no middleware', () => {
    const config = { key: 'api_key', url: 'https://api.example.com' }
    initWorkflowAIApi(config)
    expect(createClients.createJsonClient).toHaveBeenCalledWith(
      expect.objectContaining({
        ...config,
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
    expect(createClients.createStreamClient).toHaveBeenCalledWith(
      expect.objectContaining({
        ...config,
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
  })

  test('create clients is called with defaults', () => {
    initWorkflowAIApi()
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_KEY')
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_URL')
    expect(createClients.createJsonClient).toHaveBeenCalledWith(
      expect.objectContaining({
        key: undefined,
        url: 'https://api.workflowai.ai',
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
    expect(createClients.createStreamClient).toHaveBeenCalledWith(
      expect.objectContaining({
        key: undefined,
        url: 'https://api.workflowai.ai',
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
  })

  test('create clients is called with values from env', () => {
    process.env.WORKFLOWAI_API_KEY = 'qui'
    process.env.WORKFLOWAI_API_URL = 'https://api.example.com'
    initWorkflowAIApi()
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_KEY')
    expect(getEnv.getEnv).toHaveBeenCalledWith('WORKFLOWAI_API_URL')
    expect(createClients.createJsonClient).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'qui',
        url: 'https://api.example.com',
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
    expect(createClients.createStreamClient).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'qui',
        url: 'https://api.example.com',
        use: expect.arrayContaining([
          expect.objectContaining({ onRequest: expect.any(Function) }),
          expect.objectContaining({ onResponse: expect.any(Function) }),
        ]),
      })
    )
  })

  test('create clients is called with the correct arguments, with middleware', () => {
    const m1: Middleware = { onRequest: jest.fn() }
    const m2: Middleware = { onRequest: jest.fn() }
    const config = {
      key: 'api_key',
      url: 'https://api.example.com',
      use: [m1, m2],
    }
    initWorkflowAIApi(config)
    expect(createClients.createJsonClient).toHaveBeenCalledWith(
      {
        ...config,
        fetch: undefined,
        use: [
          headers,
          m1,
          m2,
          throwError,
        ],
      }
    )
  })
})
