import { resolveRefs } from 'json-refs'
import { jsonSchemaToZod, ParserOverride } from 'json-schema-to-zod'

import { definitions } from './atoms'
import { z } from './zod'

const makeParserOverride =
  (type: 'input' | 'output'): ParserOverride =>
  (schema, _refs) => {
    if (schema.title && schema.title in definitions) {
      const def = schema.title as keyof typeof definitions
      const extensionName = definitions[def][type]

      if (extensionName in z) {
        return `z.${extensionName}`
      }
    }
    return
  }

const inputParserOverride = makeParserOverride('input')
const outputParserOverride = makeParserOverride('output')

const schemaToZod = async (
  jsonSchema: any[] | object, // eslint-disable-line @typescript-eslint/no-explicit-any
  parserOverride: ParserOverride,
): Promise<string> => {
  const { resolved: resolvedJsonSchema } = await resolveRefs(jsonSchema)
  return jsonSchemaToZod(resolvedJsonSchema, { parserOverride })
}

export const inputSchemaToZod = async (
  jsonSchema: any[] | object, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<string> => {
  return schemaToZod(jsonSchema, inputParserOverride)
}

export const outputSchemaToZod = async (
  jsonSchema: any[] | object, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<string> => {
  return schemaToZod(jsonSchema, outputParserOverride)
}
