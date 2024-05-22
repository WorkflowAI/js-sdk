import {
  JsonSchemaObject,
  jsonSchemaToZod,
  ParserOverride,
} from 'json-schema-to-zod'

import { Definition, definitions } from './definitions'
import { hydrateRefs } from './json-schema-refs'

/**
 * Creates a parser override function for a specific type of Zod schema.
 * @param type - The type of Zod schema to create a parser override for.
 * @returns A parser override function that generates the corresponding Zod schema.
 */
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

/**
 * Converts a JSON schema to a Zod schema.
 *
 * @param jsonSchema - The JSON schema to convert.
 * @param parserOverride - The parser override to use.
 * @returns A promise that resolves to the Zod schema as a string.
 */
const schemaToZod = async (
  jsonSchema: JsonSchemaObject,
  parserOverride: ParserOverride,
): Promise<string> => {
  const resolvedJsonSchema = hydrateRefs(jsonSchema, { keepRefs: true })
  return jsonSchemaToZod(resolvedJsonSchema, { parserOverride })
}

/**
 * Converts an input JSON schema to a Zod schema.
 *
 * @param jsonSchema - The input JSON schema to convert.
 * @returns A promise that resolves to the Zod schema as a string.
 */
export const inputSchemaToZod = async (
  jsonSchema: JsonSchemaObject,
): Promise<string> => {
  return schemaToZod(jsonSchema, inputParserOverride)
}

/**
 * Converts an output JSON schema to a Zod schema.
 *
 * @param jsonSchema - The output JSON schema to convert.
 * @returns A promise that resolves to the Zod schema as a string.
 */
export const outputSchemaToZod = async (
  jsonSchema: JsonSchemaObject,
): Promise<string> => {
  return schemaToZod(jsonSchema, outputParserOverride)
}
