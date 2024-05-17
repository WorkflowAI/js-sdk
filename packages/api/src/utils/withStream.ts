/* eslint-disable @typescript-eslint/no-explicit-any  */

/**
 * Attach a .stream() property to a promise
 * and execute the promise only if it's then'd (aka awaited).
 * This allow syntactic sugar like using a function in these 2 ways:
 * - fn() returns a promise resolving to fn's result
 * - fn().stream() returns a promise resolving to stream's result
 *
 * This is inspired by Knex: https://knexjs.org/guide/interfaces.html#streams
 *
 * @param fn The "regular" function
 * @param stream The "stream" function, called with same params as fn
 * @returns A wrapper around fn, with a property .stream() on its result
 */
function attachStream<
  R,
  Args extends any[],
  Regular extends (...args: Args) => Promise<R>,
  S,
  Stream extends (...args: Args) => Promise<S>,
>(
  fn: Regular,
  stream: Stream,
): (...args: Args) => PromiseLike<R> & { stream: () => Promise<S> } {
  return (...args: Args) => ({
    // Proxy call to fn, execute fn only if promise is then'd/awaited
    then: (...r) => fn(...args).then(...r),
    stream: () => stream(...args),
  })
}

/**
 * Wrapper to attachStream, to solve type resolution issues
 *
 * @param fn The "regular" function
 * @param stream The "stream" function, called with same params as fn
 * @returns A wrapper around fn, with a property .stream() on its result
 */
export function withStream<
  F extends (...args: any) => Promise<any>,
  S extends (...args: any) => Promise<any>,
>(fn: F, stream: S) {
  return attachStream<
    Awaited<ReturnType<F>>,
    Parameters<F>,
    F,
    Awaited<ReturnType<S>>,
    S
  >(fn, stream)
}
