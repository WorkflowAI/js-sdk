import { zodToJsonSchema } from 'zod-to-json-schema'

import { definitions } from './definitions'
import { z } from './zod'

type Definitions = Record<string, z.ZodTypeAny>

/**
 * Converts Zod schemas to JSON schemas.
 *
 * @param definitions - An array of schema definitions.
 * @returns An object containing input and output JSON schemas.
 */
const { input: inputSchemaDefinitions, output: outputSchemaDefinitions } =
  definitions.reduce<{ input: Definitions; output: Definitions }>(
    (result, { jsonSchemaDefinitionKey, zodSchema }) => ({
      input: {
        ...result.input,
        [jsonSchemaDefinitionKey]: z[zodSchema.input](),
      },
      output: {
        ...result.output,
        [jsonSchemaDefinitionKey]: z[zodSchema.output](),
      },
    }),
    { input: {}, output: {} },
  )

/**
 * Converts a Zod schema to a JSON schema.
 *
 * @param zodSchema - The Zod schema to convert.
 * @param definitions - The JSON schema definitions to include.
 * @returns The converted JSON schema.
 */
const zodToSchema = (zodSchema: z.ZodTypeAny, definitions: Definitions) => {
  return zodToJsonSchema(zodSchema, {
    definitionPath: '$defs',
    target: 'openApi3',
    definitions: {
      ...definitions,
    },
  })
}

/**
 * Converts a Zod schema to a JSON schema.
 *
 * @param zodSchema - The Zod schema to convert.
 * @returns The converted JSON schema.
 */
export const inputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema, inputSchemaDefinitions)
}

/**
 * Converts a Zod schema to a JSON schema.
 * @param zodSchema - The Zod schema to convert.
 * @returns The converted JSON schema.
 */
export const outputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema, outputSchemaDefinitions)
}
