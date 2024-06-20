import createClient, { Middleware } from 'openapi-fetch'
const { default: createOpenapiClient } = jest.requireActual('openapi-fetch')

import { createJsonClient, createStreamClient } from './http-clients'

const use = jest.fn()

jest.mock('openapi-fetch', () => ({
  __esModule: true,
  default: jest.fn((options: Parameters<typeof createOpenapiClient>[0]) => {
    return {
      ...createOpenapiClient(options),
      use,
      isOpenApiClient: true,
    }
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createJsonClient', () => {
  it('should create a JSON client', () => {
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY',
      use: [],
    }

    const client = createJsonClient(config)

    expect('isOpenApiClient' in client.client).toBe(true)
    expect(client.client.GET).toBeInstanceOf(Function)
    expect(client.client.POST).toBeInstanceOf(Function)
    expect(client.client.PATCH).toBeInstanceOf(Function)
    expect(client.client.PUT).toBeInstanceOf(Function)
    expect(client.client.DELETE).toBeInstanceOf(Function)
    expect(client.client.HEAD).toBeInstanceOf(Function)
    expect(client.client.OPTIONS).toBeInstanceOf(Function)
    expect(client.client.GET).toBeInstanceOf(Function)

    expect(client.GET).toBeInstanceOf(Function)
    expect(client.POST).toBeInstanceOf(Function)
    expect(client.DELETE).toBeInstanceOf(Function)
    expect(client.PUT).toBeInstanceOf(Function)
    expect(client.PATCH).toBeInstanceOf(Function)
  })

  it('should call createClient with correct options', () => {
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY_23',
      use: [],
    }
    createJsonClient(config)
    expect(createClient).toHaveBeenCalledWith({
      baseUrl: 'https://api.example.com',
      headers: {
        Authorization: `Bearer API_KEY_23`,
      },
    })
  })

  it('should create a JSON client with middlewares', () => {
    const m1: Middleware = {}
    const m2: Middleware = {}
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY',
      use: [m1, m2],
    }

    const c = createJsonClient(config)
    expect(c.client.use).toHaveBeenCalledTimes(1)
    expect(c.client.use).toHaveBeenCalledWith(m1, m2)
  })
})

describe('createStreamClient', () => {
  it('should create a stream client', () => {
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY',
      use: [],
    }

    const client = createStreamClient(config)

    expect('isOpenApiClient' in client.client).toBe(true)
    expect(client.client.GET).toBeInstanceOf(Function)
    expect(client.client.POST).toBeInstanceOf(Function)
    expect(client.client.PATCH).toBeInstanceOf(Function)
    expect(client.client.PUT).toBeInstanceOf(Function)
    expect(client.client.DELETE).toBeInstanceOf(Function)
    expect(client.client.HEAD).toBeInstanceOf(Function)
    expect(client.client.OPTIONS).toBeInstanceOf(Function)
    expect(client.client.GET).toBeInstanceOf(Function)

    expect(client.POST).toBeInstanceOf(Function)
  })

  it('should call createClient with correct options', () => {
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY_9',
      use: [],
    }
    createStreamClient(config)
    expect(createClient).toHaveBeenCalledWith({
      baseUrl: 'https://api.example.com',
      headers: {
        Authorization: `Bearer API_KEY_9`,
      },
    })
  })

  it('should create a stream client with middlewares', () => {
    const m1: Middleware = {}
    const m2: Middleware = {}
    const config = {
      url: 'https://api.example.com',
      key: 'API_KEY',
      use: [m1, m2],
    }

    const c = createStreamClient(config)
    expect(c.client.use).toHaveBeenCalledTimes(1)
    expect(c.client.use).toHaveBeenCalledWith(m1, m2)
  })
})
