import withRetry from 'fetch-retry'

import { getRetryAfterDelay, getRetryAfterHeader } from './getRetryAfter'

type GlobalFetch = typeof fetch

const fetchWithRetry = withRetry(fetch)

export type RequestRetryInit = {
  /**
   * Max number of retry attempts on network error or throttling
   * @default 1
   */
  retries?: number
  /**
   * The delay from the start of the request after which we do not retry, in milliseconds.
   * @default 60_000
   */
  maxRetryDelay?: number
  /**
   * Delay for each retry on network error, in milliseconds.
   * @default 5_000
   */
  retryDelay?: number
}

export async function retriableFetch(
  input: Parameters<typeof fetchWithRetry>[0],
  init?: Parameters<typeof fetchWithRetry>[1] & RequestRetryInit,
): ReturnType<typeof fetchWithRetry> {
  const {
    retries = 1,
    retryDelay = 5_000,
    maxRetryDelay = 60_000,
  } = { ...init }

  const abortRetriesAt = Date.now() + maxRetryDelay

  return fetchWithRetry(input, {
    ...init,
    retries,
    retryDelay: (_attempt, _networkError, response) => {
      return getRetryAfterDelay(getRetryAfterHeader(response), retryDelay)
    },
    retryOn: (attempt, networkError, response) => {
      if (attempt >= retries) {
        return false
      }

      // retry on any network error, or 429 status code
      if (networkError || response?.status === 429) {
        // Only retry if we have not passed the max retry delay
        const delay = getRetryAfterDelay(
          getRetryAfterHeader(response),
          retryDelay,
        )
        if (Date.now() + delay < abortRetriesAt) {
          return true
        }
      }

      return false
    },
  })
}

export function getRetriableFetch(retryInit: RequestRetryInit): GlobalFetch {
  return async function (
    input: Parameters<GlobalFetch>[0],
    init?: Parameters<GlobalFetch>[1],
  ): ReturnType<GlobalFetch> {
    return retriableFetch(input, { ...init, ...retryInit })
  }
}
