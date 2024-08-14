import * as indexExports from './index.js'
import * as zodExports from './zod.js'

describe('index exports', () => {
  it('should re-export everything from zod', () => {
    expect(Object.keys(indexExports.z)).toEqual(Object.keys(zodExports))
  })
})
