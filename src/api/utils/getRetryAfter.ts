/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
 */

/**
 * Parse Retry-After header to extract delay, in milliseconds
 * Inspired by https://github.com/MorganConrad/parse-retry-after/blob/master/parse-retry-after6.mjs
 *
 * @param retryAfterHeaderValue Retry-After header
 * @param defaultRetryAfter Default value on missing or invalid header value, in milliseconds
 * @returns Milliseconds
 */
export function getRetryAfterDelay(
  retryAfterHeaderValue: string | null | undefined,
  defaultRetryAfter: number
): number {
  if (!retryAfterHeaderValue) {
    return defaultRetryAfter;
  }

  const seconds = Number(retryAfterHeaderValue);
  if (Number.isFinite(seconds)) {
    return seconds * 1_000;
  }

  const retryAt = Date.parse(retryAfterHeaderValue);
  if (Number.isNaN(retryAt)) {
    return defaultRetryAfter;
  }

  const millis = retryAt - Date.now();
  if (millis < 0) {
    return defaultRetryAfter;
  }

  return millis;
}

/**
 * Extract Retry-After header from Fetch Response, if any
 *
 * @param response Fetch response
 * @returns Header value
 */
export function getRetryAfterHeader(
  response: Response | undefined | null
): string | null | undefined {
  return response?.headers?.get('Retry-After');
}
