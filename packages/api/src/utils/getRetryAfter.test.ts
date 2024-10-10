import { getRetryAfterDelay, getRetryAfterHeader } from './getRetryAfter.js';

describe('getRetryAfter', () => {
  describe('getRetryAfterDelay', () => {
    it('returns default value for null input', () => {
      expect(getRetryAfterDelay(null, 1000)).toBe(1000);
    });

    it('returns default value for undefined input', () => {
      expect(getRetryAfterDelay(undefined, 1000)).toBe(1000);
    });

    it('returns calculated delay for numeric input', () => {
      expect(getRetryAfterDelay('60', 1000)).toBe(60000);
    });

    it('returns default value for non-numeric, non-date input', () => {
      expect(getRetryAfterDelay('abc', 1000)).toBe(1000);
    });

    it('returns calculated delay for valid date input', () => {
      const futureDate = new Date(Date.now() + 5000).toUTCString();
      expect(getRetryAfterDelay(futureDate, 1000)).toBeGreaterThan(0);
    });

    it('returns default value for past date input', () => {
      const pastDate = new Date(Date.now() - 5000).toUTCString();
      expect(getRetryAfterDelay(pastDate, 1000)).toBe(1000);
    });
  });

  describe('getRetryAfterHeader', () => {
    it('extracts Retry-After header from response', () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('120'),
        },
      };
      expect(getRetryAfterHeader(mockResponse as unknown as Response)).toBe(
        '120'
      );
      expect(mockResponse.headers.get).toHaveBeenCalledWith('Retry-After');
    });

    it('returns undefined for null response', () => {
      expect(getRetryAfterHeader(null)).toBeUndefined();
    });

    it('returns undefined for undefined response', () => {
      expect(getRetryAfterHeader(undefined)).toBeUndefined();
    });
  });
});
