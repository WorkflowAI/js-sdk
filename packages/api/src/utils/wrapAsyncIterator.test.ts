import { wrapAsyncIterator } from './wrapAsyncIterator'

describe('wrapAsyncIterator', () => {
  it('should transform values from the original async iterator', async () => {
    const original = (async function* () {
      yield 1
      yield 2
      yield 3
    })()

    const mapValue = (from: number) => from * 2

    const transformedIterator = wrapAsyncIterator(original, mapValue)

    const transformedValues: number[] = []
    for await (const value of transformedIterator) {
      transformedValues.push(value)
    }

    expect(transformedValues).toEqual([2, 4, 6])
  })

  it('should handle promises returned by the value transformer', async () => {
    const original = (async function* () {
      yield 1
      yield 2
      yield 3
    })()

    const mapValue = (from: number) => Promise.resolve(from * 2)

    const transformedIterator = wrapAsyncIterator(original, mapValue)

    const transformedValues: number[] = []
    for await (const value of transformedIterator) {
      transformedValues.push(value)
    }

    expect(transformedValues).toEqual([2, 4, 6])
  })

  it('should handle empty async iterators', async () => {
    const original = (async function* () {})()

    const mapValue = (from: number) => from * 2

    const transformedIterator = wrapAsyncIterator(original, mapValue)

    const transformedValues: number[] = []
    for await (const value of transformedIterator) {
      transformedValues.push(value)
    }

    expect(transformedValues).toEqual([])
  })

  it('should forward the return() method to the original async iterator', async () => {
    let returnCalled = false
    const original = (async function* () {
      try {
        yield 1
        yield 2
        yield 3
      } finally {
        returnCalled = true
      }
    })()

    const mapValue = (from: number) => from * 2
    const transformedIterator = wrapAsyncIterator(original, mapValue)

    const transformedValues: number[] = []
    for await (const value of transformedIterator) {
      transformedValues.push(value)
      if (value === 2) {
        transformedIterator.return?.()
      }
    }

    expect(transformedValues).toEqual([2, 4])
    expect(returnCalled).toBe(true)
  })

  it('should forward the throw() method to the original async iterator', async () => {
    let throwCalled = false
    const original = (async function* () {
      try {
        yield 1
        yield 2
        yield 3
      } catch {
        throwCalled = true
      }
    })()
    const mapValue = (from: number) => from * 2
    const transformedIterator = wrapAsyncIterator(original, mapValue)
    const transformedValues: number[] = []
    try {
      for await (const value of transformedIterator) {
        transformedValues.push(value)
        if (value === 2) {
          transformedIterator.throw?.(new Error('Test Error'))
        }
      }
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(error.message).toBe('Test Error')
      expect(throwCalled).toBe(true)
    }
    expect(transformedValues).toEqual([2])
  })

  it('should return the transformed async iterator when using Symbol.asyncIterator', async () => {
    const original = (async function* () {
      yield 1
      yield 2
      yield 3
    })()
    const mapValue = (from: number) => from * 2
    const transformedIterator = wrapAsyncIterator(original, mapValue)
    const transformedValues: number[] = []
    const asyncIterator = transformedIterator[Symbol.asyncIterator]()
    for await (const value of asyncIterator) {
      transformedValues.push(value)
    }
    expect(transformedValues).toEqual([2, 4, 6])
  })
})
