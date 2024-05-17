import { z } from './zod'
import * as extensions from './zod/extensions'

type ZodExtensionName = keyof typeof extensions & keyof typeof z

export type Definition = {
  jsonSchemaDefinitionKey: string
  zodSchema: {
    input: ZodExtensionName
    output: ZodExtensionName
  }
}

export const definitions: Definition[] = [
  {
    jsonSchemaDefinitionKey: 'DatetimeLocal',
    zodSchema: {
      input: 'datetimeLocal',
      output: 'datetimeLocal',
    },
  },
  {
    jsonSchemaDefinitionKey: 'Image',
    zodSchema: {
      input: 'imageInput',
      output: 'imageOutput',
    },
  },
]
