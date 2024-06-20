import mockFetch from 'jest-fetch-mock'

import { retriableFetch } from './fetch'
import { getRetryAfterDelay, getRetryAfterHeader } from './getRetryAfter'

jest.mock('./getRetryAfter')

describe('fetch with retry', () => {
  const mockGetRetryAfterDelay = jest.fn(
    (_header: string, _defaultValue: number) => 10,
  )
  const mockGetRetryAfterHeader = jest.fn()
  beforeAll(() => {
    mockFetch.enableMocks()
    ;(getRetryAfterDelay as jest.Mock).mockImplementation(
      mockGetRetryAfterDelay,
    )
    ;(getRetryAfterHeader as jest.Mock).mockImplementation(
      mockGetRetryAfterHeader,
    )
  })

  afterAll(() => {
    mockFetch.disableMocks()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.resetMocks()
  })

  it('performs a successful fetch without retries', async () => {
    mockFetch.mockResponseOnce('success')
    const response = await retriableFetch('http://example.com')
    expect(await response.text()).toBe('success')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('retries on network error until success', async () => {
    mockFetch
      .mockRejectOnce(new Error('Network error'))
      .mockResponseOnce('success')
    const response = await retriableFetch('http://example.com', { retries: 2 })
    expect(await response.text()).toBe('success')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('retries on HTTP 429 until success', async () => {
    mockFetch
      .mockResponseOnce(async () => ({ status: 429 }))
      .mockResponseOnce('success')
    mockGetRetryAfterHeader.mockReturnValueOnce(null)
    const response = await retriableFetch('http://example.com', { retries: 2 })
    expect(await response.text()).toBe('success')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('respects retries parameter and stops after specified attempts', async () => {
    mockFetch.mockResponse(() => Promise.resolve({ status: 429 }))
    const res = await retriableFetch('http://example.com', { retries: 3 })
    expect(res.status).toBe(429)
    expect(mockFetch).toHaveBeenCalledTimes(4) // Initial try + 3 retries
  })

  it('respects maxRetryDelay and stops retrying', async () => {
    mockFetch.mockResponse(() => Promise.resolve({ status: 429 }))
    mockGetRetryAfterHeader.mockReturnValue(null)
    mockGetRetryAfterDelay.mockReturnValue(100000) // Return a delay longer than maxRetryDelay
    const res = await retriableFetch('http://example.com', {
      maxRetryDelay: 5000,
    })
    expect(res.status).toBe(429)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('uses retryDelay for the delay between retries', async () => {
    mockFetch
      .mockResponseOnce(async () => ({ status: 429 }))
      .mockResponseOnce('success')
    mockGetRetryAfterHeader.mockReturnValueOnce(null)
    mockGetRetryAfterDelay.mockImplementation(
      (_, defaultDelay: number) => defaultDelay,
    )
    const response = await retriableFetch('http://example.com', {
      retryDelay: 3000,
      retries: 1,
    })
    expect(await response.text()).toBe('success')
    expect(mockGetRetryAfterDelay).toHaveBeenCalledWith(null, 3000)
  })

  it('stops retrying when retryOn condition is not met', async () => {
    mockFetch.mockResponseOnce(async () => ({ status: 500 }))
    expect(
      await retriableFetch('http://example.com').then((res) => res.status),
    ).toBe(500)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
