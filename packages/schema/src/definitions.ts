import { z } from './zod'
import * as extensions from './zod/extensions'

type ZodExtensionName = keyof typeof extensions & keyof typeof z

export type Definition = {
  jsonSchemaTitle: string
  zodSchema: {
    input: ZodExtensionName
    output: ZodExtensionName
  }
}

export const definitions: Definition[] = [
  {
    jsonSchemaTitle: 'DatetimeLocal',
    zodSchema: {
      input: 'datetimeLocal',
      output: 'datetimeLocal',
    },
  },
  {
    jsonSchemaTitle: 'Image',
    zodSchema: {
      input: 'imageInput',
      output: 'imageOutput',
    },
  },
]
