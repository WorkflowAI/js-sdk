import { BASE64_TO_BUFFER, BUFFER, BUFFER_TO_BASE64 } from './buffer'

describe('BUFFER', () => {
  it('should validate a Buffer instance', () => {
    const buffer = Buffer.from('test')
    expect(() => BUFFER.parse(buffer)).not.toThrow()
  })

  it('should validate an ArrayBuffer instance', () => {
    const arrayBuffer = new TextEncoder().encode('test').buffer
    expect(() => BUFFER.parse(arrayBuffer)).not.toThrow()
  })

  it('should transform an ArrayBuffer to a Buffer', () => {
    const arrayBuffer = new TextEncoder().encode('test').buffer
    const result = BUFFER.parse(arrayBuffer)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString()).toBe('test')
  })

  it('should throw for an invalid input', () => {
    expect(() => BUFFER.parse('invalid')).toThrow()
  })
})

describe('BUFFER_TO_BASE64', () => {
  it('should transform a Buffer to a base64 string', () => {
    const buffer = Buffer.from('test')
    const result = BUFFER_TO_BASE64.parse(buffer)
    expect(result).toBe('dGVzdA==')
  })

  it('should transform an ArrayBuffer to a base64 string', () => {
    const arrayBuffer = new TextEncoder().encode('test').buffer
    const result = BUFFER_TO_BASE64.parse(arrayBuffer)
    expect(result).toBe('dGVzdA==')
  })

  it('should throw for an invalid input', () => {
    expect(() => BUFFER_TO_BASE64.parse('invalid')).toThrow()
  })
})

describe('BASE64_TO_BUFFER', () => {
  it('should transform a base64 string to a Buffer', () => {
    const base64 = 'dGVzdA=='
    const result = BASE64_TO_BUFFER.parse(base64)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.toString()).toBe('test')
  })

  it('should throw for a non-base64 string', () => {
    expect(() => BASE64_TO_BUFFER.parse('invalid')).toThrow()
  })

  it('should throw for a non-string input', () => {
    expect(() => BASE64_TO_BUFFER.parse(123)).toThrow()
  })
})
