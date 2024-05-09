import { resolveRefs } from 'json-refs'
import {
  JsonSchemaObject,
  jsonSchemaToZod,
  ParserOverride,
} from 'json-schema-to-zod'

import { Definition, definitions } from './definitions'

const makeParserOverride =
  (type: keyof Definition['zodSchema']): ParserOverride =>
  (schema, _refs) => {
    if (schema.title) {
      const definition = definitions.find(
        ({ jsonSchemaTitle }) => jsonSchemaTitle === schema.title,
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
  const { resolved: resolvedJsonSchema } = await resolveRefs(jsonSchema)
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
