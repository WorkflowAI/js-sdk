import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { definitions, zodExtensions } from './atoms'

type Definitions = Record<string, z.ZodTypeAny>

const inputSchemaDefinitions: Definitions = {}
const outputSchemaDefinitions: Definitions = {}

for (const _def in definitions) {
  const def = _def as keyof typeof definitions

  const inputExtensionName = definitions[def]
    .input as keyof typeof zodExtensions
  if (zodExtensions[inputExtensionName]) {
    inputSchemaDefinitions[def] = zodExtensions[inputExtensionName]
  }

  const outputExtensionName = definitions[def]
    .output as keyof typeof zodExtensions
  if (zodExtensions[outputExtensionName]) {
    outputSchemaDefinitions[def] = zodExtensions[outputExtensionName]
  }
}

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
