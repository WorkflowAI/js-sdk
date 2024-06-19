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

import type { paths } from './generated/openapi'
import type { Middleware } from './middlewares'
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
}

function extender<T>(extension: T) {
  return function extend<O>(o: O): typeof o {
    return { ...o, ...extension }
  }
}

function forceParseAs(parseAs: RequestOptions<object>['parseAs']) {
  return extender<Pick<RequestOptions<object>, 'parseAs'>>({ parseAs })
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

  const cleanInit = forceParseAs('json')

  const GET =
    <P extends PathsWithMethod<paths, 'get'>>(path: P) =>
    (init: Init<paths[P], 'get'>) =>
      jsonClient.GET(path, cleanInit(init))

  const PUT =
    <P extends PathsWithMethod<paths, 'put'>>(path: P) =>
    <I = Init<paths[P], 'put'>>(init: I) =>
      jsonClient.PUT(
        path,
        // @ts-expect-error For some obscure TS reason, PUT gives an error 🤷
        cleanInit(init),
      )

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    (init: Init<paths[P], 'post'>) =>
      jsonClient.POST(path, cleanInit(init))

  const PATCH =
    <P extends PathsWithMethod<paths, 'patch'>>(path: P) =>
    (init: Init<paths[P], 'patch'>) =>
      jsonClient.PATCH(path, cleanInit(init))

  const DELETE =
    <P extends PathsWithMethod<paths, 'delete'>>(path: P) =>
    (init: Init<paths[P], 'delete'>) =>
      jsonClient.DELETE(path, cleanInit(init))

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

  const cleanInit = forceParseAs('stream')

  const POST =
    <P extends PathsWithMethod<paths, 'post'>>(path: P) =>
    async (init: Init<paths[P], 'post'>) => {
      const { response } = await streamClient.POST(path, cleanInit(init))

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
