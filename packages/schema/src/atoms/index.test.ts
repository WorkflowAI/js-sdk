import * as bufferExports from './buffer.js'
import * as datetimeLocalExports from './datetime-local.js'
import * as imageExports from './image.js'
import * as indexExports from './index.js'

describe('index exports', () => {
  it('should re-export everything from buffer', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(bufferExports)),
    )
  })

  it('should re-export everything from datetime-local', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(datetimeLocalExports)),
    )
  })

  it('should re-export everything from image', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(imageExports)),
    )
  })
})
