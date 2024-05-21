import { events as asServerSentEvents } from 'fetch-event-stream'
import createClient, { MaybeOptionalInit } from 'openapi-fetch'
import type {
  GetValueWithDefault,
  MediaType,
  PathsWithMethod,
} from 'openapi-typescript-helpers'

import type { paths } from './generated/openapi'
import type { Middleware } from './middlewares'
import { wrapAsyncIterator } from './utils/wrapAsyncIterator'

type CreateHttpClientConfig = {
  url: string
  key: string | undefined
  use: Middleware[]
}

/**
 * Get a low-level openapi client for a specific return content-type
 *
 * @param config
 * @returns OpenAPI-fetch client
 */
function getClient<Paths extends object, Media extends MediaType>({
  url,
  key,
  use,
}: CreateHttpClientConfig) {
  const client = createClient<Paths, Media>({
    baseUrl: url,
    headers: {
      Authorization: `Bearer ${key}`,
    },
  })

  // Register middlewares
  client.use(...use)

  return client
}

/**
 * Non-streaming client, responses are expected to be JSON
 *
 * @param config
 * @returns
 */
export function createJsonClient(config: CreateHttpClientConfig) {
  const jsonClient = getClient<paths, 'application/json'>(config)

  const GET =
    <P extends PathsWithMethod<paths, 'get'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'get'>) =>
      jsonClient.GET(path, { ...init, parseAs: 'json' })

  const PUT =
    <P extends PathsWithMethod<paths, 'put'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'put'>) =>
      jsonClient.PUT(path, { ...init, parseAs: 'json' })

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'post'>) =>
      jsonClient.POST(path, { ...init, parseAs: 'json' })

  const PATCH =
    <P extends PathsWithMethod<paths, 'patch'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'patch'>) =>
      jsonClient.PATCH(path, { ...init, parseAs: 'json' })

  const DELETE =
    <P extends PathsWithMethod<paths, 'delete'>>(path: P) =>
    (init: MaybeOptionalInit<paths[P], 'delete'>) =>
      jsonClient.DELETE(path, { ...init, parseAs: 'json' })

  return {
    client: jsonClient,
    GET,
    POST,
    PUT,
    PATCH,
    DELETE,
  }
}

/**
 * Streaming client, responses are expected to be server-sent events, with JSON as `data`
 *
 * @param config
 * @returns
 */
export function createStreamClient(config: CreateHttpClientConfig) {
  const streamClient = getClient<paths, 'text/event-stream'>(config)

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    async (init: MaybeOptionalInit<paths[P], 'post'>) => {
      const { response } = await streamClient.POST(path, {
        ...init,
        // Make sure to interpret responses as streams
        parseAs: 'stream',
      })

      return {
        response,
        // Wrap response stream in an easy-to-use async iterator
        // with event data JSON parsed
        stream: wrapAsyncIterator(
          asServerSentEvents(response),
          (
            value,
          ): {
            data:
              | GetValueWithDefault<
                  paths[P]['post']['responses'][200]['content'],
                  'text/event-stream',
                  Record<string, unknown>
                >
              | undefined
          } => ({
            data: value?.data ? JSON.parse(value.data) : undefined,
          }),
        ),
      }
    }

  return {
    client: streamClient,
    POST,
  }
}
