import { BASE64_DATA_URL_TO_BASE64 } from '../../atoms/data-url'

describe('BASE64_DATA_URL_TO_BASE64', () => {
  it('should transform a base64 data URL to a base64 string', () => {
    const base64DataUrl = 'data:text/plain;base64,dGVzdA=='
    const result = BASE64_DATA_URL_TO_BASE64.parse(base64DataUrl)
    expect(result).toBe('dGVzdA==')
  })

  it('should transform a base64 data URL with a different MIME type to a base64 string', () => {
    const base64DataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA'
    const result = BASE64_DATA_URL_TO_BASE64.parse(base64DataUrl)
    expect(result).toBe('iVBORw0KGgoAAAANSUhEUgAA')
  })

  it('should throw for an invalid base64 data URL', () => {
    const invalidBase64DataUrl = 'data:text/plain;base64,invalidbase64'
    expect(() => BASE64_DATA_URL_TO_BASE64.parse(invalidBase64DataUrl)).toThrow()
  })

  it('should throw for a non-base64 data URL string', () => {
    const nonBase64DataUrl = 'data:text/plain;charset=utf-8,some text'
    expect(() => BASE64_DATA_URL_TO_BASE64.parse(nonBase64DataUrl)).toThrow()
  })

  it('should throw for a completely invalid input', () => {
    const invalidInput = 'not a data URL'
    expect(() => BASE64_DATA_URL_TO_BASE64.parse(invalidInput)).toThrow()
  })
})
