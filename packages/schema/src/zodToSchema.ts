import { zodToJsonSchema } from 'zod-to-json-schema'

import { definitions } from './definitions.js'
import { z } from './zod/index.js'

type ConvertedSchema = Omit<
  ReturnType<typeof zodToJsonSchema>,
  'definitions'
> & {
  $defs?: ReturnType<typeof zodToJsonSchema>['definitions']
}

/**
 * Converts a Zod schema to a JSON schema.
 *
 * @param zodSchema - The Zod schema to convert.
 * @param definitions - The JSON schema definitions to include.
 * @returns The converted JSON schema.
 */
const zodToSchema = (zodSchema: z.ZodTypeAny) => {
  const schema: ConvertedSchema = zodToJsonSchema(zodSchema, {
    definitionPath: '$defs',
    target: 'openApi3',
    definitions,
  })

  const defs = schema['$defs']
  if (!defs) return schema

  // Remove keys that are exposed in defintions as they will be added by the backend
  for (const key in definitions) {
    delete defs[key]
  }

  return schema
}

/**
 * Converts a Zod schema to a JSON schema.
 *
 * @param zodSchema - The Zod schema to convert.
 * @returns The converted JSON schema.
 */
export const inputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema)
}

/**
 * Converts a Zod schema to a JSON schema.
 * @param zodSchema - The Zod schema to convert.
 * @returns The converted JSON schema.
 */
export const outputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema)
}
