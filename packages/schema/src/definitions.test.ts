import { definitions } from './definitions.js'
import * as extensions from './zod/extensions.js'
import { z } from './zod/index.js'

describe('definitions', () => {
  definitions.forEach((definition) => {
    it(`${definition.jsonSchemaDefinitionKey} should have a string jsonSchemaDefinitionKey`, () => {
      expect(typeof definition.jsonSchemaDefinitionKey).toBe('string')
    })

    it(`${definition.jsonSchemaDefinitionKey} should have valid zodSchema input and output`, () => {
      expect(
        definition.zodSchema.input in extensions &&
          definition.zodSchema.input in z,
      ).toBe(true)
      expect(
        definition.zodSchema.output in extensions &&
          definition.zodSchema.output in z,
      ).toBe(true)
    })
  })
})
