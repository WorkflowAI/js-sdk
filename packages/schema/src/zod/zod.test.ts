import * as extensions from './extensions'
import * as zodExports from './zod'

describe('zod exports', () => {
  it('should re-export everything from extensions', () => {
    expect(Object.keys(zodExports)).toEqual(
      expect.arrayContaining(Object.keys(extensions)),
    )
  })
})
