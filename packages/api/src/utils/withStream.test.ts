import { withStream } from './withStream'

describe('withStream', () => {
  // Existing test case
  it('should attach a .stream() property to the result of the regular function', async () => {
    const regularFn = async (num: number) => num * 2
    const streamFn = async (num: number) => num * 3

    const wrappedFn = withStream(regularFn, streamFn)
    const result = wrappedFn(5)

    expect(await result).toBe(10)
    expect(result.stream).toBeDefined()
    expect(await result.stream()).toBe(15)
  })

  // New test case: Ensure the regular function is called with the correct arguments
  it('should call the regular function with the correct arguments', async () => {
    const mock = jest.fn()
    const regularFn = async (...args: any[]) => mock(...args) // eslint-disable-line @typescript-eslint/no-explicit-any
    const streamFn = async () => {}

    const wrappedFn = withStream(regularFn, streamFn)
    await wrappedFn(1, 'test', true)

    expect(mock).toHaveBeenCalledWith(1, 'test', true)
  })

  // New test case: Ensure the stream function is called with the correct arguments
  it('should call the stream function with the correct arguments', async () => {
    const regularFn = jest.fn()
    const streamFn = jest.fn()

    const wrappedFn = withStream(regularFn, streamFn)
    await wrappedFn(1, 'test', true).stream()

    expect(streamFn).toHaveBeenCalledWith(1, 'test', true)
  })

  // New test case: Ensure the regular function is awaited when called without .stream()
  it('should await the regular function when called without .stream()', async () => {
    const regularFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'regular'
    }
    const streamFn = async () => 'stream'

    const wrappedFn = withStream(regularFn, streamFn)
    const result = await wrappedFn()

    expect(result).toBe('regular')
  })

  // New test case: Ensure the stream function is awaited when called with .stream()
  it('should await the stream function when called with .stream()', async () => {
    const regularFn = async () => 'regular'
    const streamFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'stream'
    }

    const wrappedFn = withStream(regularFn, streamFn)
    const result = await wrappedFn().stream()

    expect(result).toBe('stream')
  })

  it('should not execute regular function if not awaited', async () => {
    const regularFn = async () => {
      throw new Error('This should not be called')
    }
    const streamFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      return 'stream'
    }

    const wrappedFn = withStream(regularFn, streamFn)
    const result = await wrappedFn().stream()

    expect(result).toBe('stream')
  })
})
