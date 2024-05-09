import { zodToJsonSchema } from 'zod-to-json-schema'

import { definitions } from './definitions'
import { z } from './zod'

type Definitions = Record<string, z.ZodTypeAny>

const { input: inputSchemaDefinitions, output: outputSchemaDefinitions } =
  definitions.reduce<{ input: Definitions; output: Definitions }>(
    (result, { jsonSchemaTitle, zodSchema }) => ({
      input: {
        ...result.input,
        [jsonSchemaTitle]: z[zodSchema.input](),
      },
      output: {
        ...result.output,
        [jsonSchemaTitle]: z[zodSchema.output](),
      },
    }),
    { input: {}, output: {} },
  )

const zodToSchema = (zodSchema: z.ZodTypeAny, definitions: Definitions) => {
  return zodToJsonSchema(zodSchema, {
    definitionPath: '$defs',
    target: 'openApi3',
    definitions: {
      ...definitions,
    },
  })
}

export const inputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema, inputSchemaDefinitions)
}

export const outputZodToSchema = async (zodSchema: z.ZodTypeAny) => {
  return zodToSchema(zodSchema, outputSchemaDefinitions)
}
