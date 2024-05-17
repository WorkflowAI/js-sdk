import * as indexExports from '../index'
import * as schemaToZodExports from '../schemaToZod'
import * as zodExports from '../zod'
import * as zodToSchemaExports from '../zodToSchema'

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
