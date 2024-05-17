import {
  JsonSchemaObject,
  jsonSchemaToZod,
  ParserOverride,
} from 'json-schema-to-zod'

import { Definition, definitions } from './definitions'
import { hydrateRefs } from './json-schema-refs'

const makeParserOverride =
  (type: keyof Definition['zodSchema']): ParserOverride =>
  (schema, _refs) => {
    if (schema.$ref) {
      const definition = definitions.find(
        ({ jsonSchemaDefinitionKey }) =>
          jsonSchemaDefinitionKey === schema.$ref.split('/$defs/').pop(),
      )
      if (definition) {
        return `z.${definition.zodSchema[type]}()`
      }
    }
    return
  }

const inputParserOverride = makeParserOverride('input')
const outputParserOverride = makeParserOverride('output')

const schemaToZod = async (
  jsonSchema: JsonSchemaObject,
  parserOverride: ParserOverride,
): Promise<string> => {
  const resolvedJsonSchema = hydrateRefs(jsonSchema, { keepRefs: true })
  return jsonSchemaToZod(resolvedJsonSchema, { parserOverride })
}

export const inputSchemaToZod = async (
  jsonSchema: JsonSchemaObject,
): Promise<string> => {
  return schemaToZod(jsonSchema, inputParserOverride)
}

export const outputSchemaToZod = async (
  jsonSchema: JsonSchemaObject,
): Promise<string> => {
  return schemaToZod(jsonSchema, outputParserOverride)
}
