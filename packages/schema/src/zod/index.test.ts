import * as indexExports from './index'
import * as zodExports from './zod'

describe('index exports', () => {
  it('should re-export everything from zod', () => {
    expect(Object.keys(indexExports.z)).toEqual(Object.keys(zodExports))
  })
})
