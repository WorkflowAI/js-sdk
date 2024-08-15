import * as indexExports from './index.js'
import * as schemaToZodExports from './schemaToZod.js'
import * as zodExports from './zod/index.js'
import * as zodToSchemaExports from './zodToSchema.js'

describe('index exports', () => {
  it('should re-export everything from schemaToZod', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(schemaToZodExports)),
    )
  })

  it('should re-export everything from zod', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(zodExports)),
    )
  })

  it('should re-export everything from zodToSchema', () => {
    expect(Object.keys(indexExports)).toEqual(
      expect.arrayContaining(Object.keys(zodToSchemaExports)),
    )
  })
})
