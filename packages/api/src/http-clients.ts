import { events as asServerSentEvents } from 'fetch-event-stream'
import createClient, {
  MaybeOptionalInit,
  PathMethods,
  RequestOptions,
} from 'openapi-fetch'
import type {
  GetValueWithDefault,
  HasRequiredKeys,
  MediaType,
  PathsWithMethod,
} from 'openapi-typescript-helpers'

import type { FetchOptions } from '.'
import type { paths } from './generated/openapi'
import type { Middleware } from './middlewares'
import { RequestRetryInit, retriableFetch } from './utils/retriableFetch'
import { wrapAsyncIterator } from './utils/wrapAsyncIterator'

type Init<
  P extends PathMethods,
  M extends keyof P,
  I = MaybeOptionalInit<P, M>,
> = HasRequiredKeys<I> extends never ? I & { [key: string]: unknown } : I

type CreateHttpClientConfig = {
  url: string
  key: string | undefined
  use: Middleware[]
  fetch?: FetchOptions
}

/**
 * Factory for prepareInit's
 * @param parseAs How to parse response, json or stream for example
 */
function getPrepareInit(parseAs: RequestOptions<object>['parseAs']) {
  /**
   * Cleans up and prepares init options for openapi-fetch
   * Forse type casting to something openapi-fetch is ok with
   * @param init "Augmented" init, with retry options
   * @returns Init expected by openapi-fetch
   */
  return function prepareInit<
    P extends PathMethods,
    M extends keyof P,
    I = Init<P, M>,
  >(init: I & RequestRetryInit): I {
    return {
      ...init,
      parseAs,
    } as I // not very nice but we have to force openapi-fetch hand :/
  }
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
  fetch: fetchOptions,
}: CreateHttpClientConfig) {
  const client = createClient<Paths, Media>({
    baseUrl: url,
    headers: {
      Authorization: `Bearer ${key}`,
    },
    fetch: retriableFetch,
    ...fetchOptions,
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

  const prepareInit = getPrepareInit('json')

  const GET =
    <P extends PathsWithMethod<paths, 'get'>>(path: P) =>
    (init: Init<paths[P], 'get'> & RequestRetryInit) =>
      jsonClient.GET(path, prepareInit(init))

  const PUT =
    <P extends PathsWithMethod<paths, 'put'>>(path: P) =>
    <I = Init<paths[P], 'put'> & RequestRetryInit>(init: I) =>
      jsonClient.PUT(
        path,
        // @ts-expect-error For some obscure TS reason, PUT gives an error 🤷
        prepareInit(init),
      )

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    (init: Init<paths[P], 'post'> & RequestRetryInit) =>
      jsonClient.POST(path, prepareInit(init))

  const PATCH =
    <P extends PathsWithMethod<paths, 'patch'>>(path: P) =>
    (init: Init<paths[P], 'patch'> & RequestRetryInit) =>
      jsonClient.PATCH(path, prepareInit(init))

  const DELETE =
    <P extends PathsWithMethod<paths, 'delete'>>(path: P) =>
    (init: Init<paths[P], 'delete'> & RequestRetryInit) =>
      jsonClient.DELETE(path, prepareInit(init))

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

  const prepareInit = getPrepareInit('stream')

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    async (init: Init<paths[P], 'post'> & RequestRetryInit) => {
      const { response } = await streamClient.POST(path, prepareInit(init))

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
