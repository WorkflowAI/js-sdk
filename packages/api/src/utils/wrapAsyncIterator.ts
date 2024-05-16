/**
 * Wrap an AsyncIterator to transform its value
 *
 * @param original Source async iterator, where values come from
 * @param mapValue Value transformer
 * @returns Async iterator returning the transformed values
 */
export const wrapAsyncIterator = <From, To>(
  original: AsyncIterator<From>,
  mapValue: (from: From) => To | Promise<To>,
): AsyncIterableIterator<To> => {
  return {
    async next() {
      const { done, value } = await original.next()
      return {
        done,
        value: await mapValue(value),
      }
    },
    return(value) {
      original.return?.(value)
      return value
    },
    throw(e) {
      original.throw?.(e)
      return e
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }
}
