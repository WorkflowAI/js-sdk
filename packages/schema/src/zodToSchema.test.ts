import { z } from './zod/index.js'
import { inputZodToSchema, outputZodToSchema } from './zodToSchema.js'

const INPUT_DEFINITIONS = {
  $defs: {
    DatetimeLocal: {
      additionalProperties: false,
      description:
        'This class represents a local datetime, with a datetime and a timezone.',
      properties: {
        date: {
          description: 'The date of the local datetime.',
          format: 'date',
          type: 'string',
        },
        local_time: {
          description: 'The time of the local datetime without timezone info.',
          format: 'time',
          type: 'string',
        },
        timezone: {
          description: 'The timezone of the local time.',
          type: 'string',
        },
      },
      required: ['date', 'local_time', 'timezone'],
      type: 'object',
    },
    Image: {
      additionalProperties: false,
      properties: {
        content_type: {
          description: 'The content type of the image',
          enum: [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp',
            'image/tiff',
            'image/gif',
          ],
          type: 'string',
        },
        data: {
          anyOf: [
            {
              anyOf: [
                {
                  contentEncoding: 'base64',
                  type: 'string',
                },
                {
                  pattern: '^data:[^;]*;base64,[-A-Za-z0-9+/]+={0,3}$',
                  type: 'string',
                },
                {
                  anyOf: [{}, {}],
                },
              ],
            },
            {
              $ref: '#/$defs/Image/properties/data/anyOf/0',
            },
          ],
          description: 'The Buffer or base64 encoded data of the image',
        },
        name: {
          description: 'An optional name',
          type: 'string',
        },
      },
      required: ['content_type', 'data'],
      type: 'object',
    },
  },
  additionalProperties: false,
}

const OUTPUT_DEFINITIONS = {
  $defs: {
    DatetimeLocal: {
      additionalProperties: false,
      description:
        'This class represents a local datetime, with a datetime and a timezone.',
      properties: {
        date: {
          description: 'The date of the local datetime.',
          format: 'date',
          type: 'string',
        },
        local_time: {
          description: 'The time of the local datetime without timezone info.',
          format: 'time',
          type: 'string',
        },
        timezone: {
          description: 'The timezone of the local time.',
          type: 'string',
        },
      },
      required: ['date', 'local_time', 'timezone'],
      type: 'object',
    },
    Image: {
      additionalProperties: false,
      properties: {
        content_type: {
          description: 'The content type of the image',
          enum: [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp',
            'image/tiff',
            'image/gif',
          ],
          type: 'string',
        },
        data: {
          contentEncoding: 'base64',
          description: 'The data of the image as Buffer',
          type: 'string',
        },
        name: {
          description: 'An optional name',
          type: 'string',
        },
      },
      required: ['content_type', 'data'],
      type: 'object',
    },
  },
  additionalProperties: false,
}

describe('zodToSchema', () => {
  test('should convert input Zod schema to JSON schema', async () => {
    const inputSchema = z.object({
      name: z.string(),
      age: z.number(),
    })

    const jsonSchema = await inputZodToSchema(inputSchema)

    expect(jsonSchema).toEqual({
      ...INPUT_DEFINITIONS,
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: ['name', 'age'],
    })
  })

  test('should convert image Zod schema to JSON schema', async () => {
    const imageSchema = z.object({
      i: z.imageInput(),
    })
    const jsonSchema = await inputZodToSchema(imageSchema)
    expect(jsonSchema).toEqual({
      ...INPUT_DEFINITIONS,
      type: 'object',
      properties: {
        i: {
          $ref: '#/$defs/Image',
        },
      },
      required: ['i'],
    })
  })

  test('should convert DatetimeLocal Zod schema to JSON schema', async () => {
    const datetimeLocalSchema = z.object({
      d: z.datetimeLocal(),
    })
    const jsonSchema = await inputZodToSchema(datetimeLocalSchema)
    expect(jsonSchema).toEqual({
      ...INPUT_DEFINITIONS,
      type: 'object',
      properties: {
        d: {
          $ref: '#/$defs/DatetimeLocal',
        },
      },
      required: ['d'],
    })
  })

  test('should convert output Zod schema to JSON schema', async () => {
    const outputSchema = z.object({
      success: z.boolean(),
      message: z.string(),
    })

    const jsonSchema = await outputZodToSchema(outputSchema)

    expect(jsonSchema).toEqual({
      ...OUTPUT_DEFINITIONS,
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
      required: ['success', 'message'],
    })
  })

  test('should convert image Zod schema to JSON schema (output)', async () => {
    const imageSchema = z.object({
      i: z.imageOutput(),
    })
    const jsonSchema = await outputZodToSchema(imageSchema)
    expect(jsonSchema).toEqual({
      ...OUTPUT_DEFINITIONS,
      type: 'object',
      properties: {
        i: {
          $ref: '#/$defs/Image',
        },
      },
      required: ['i'],
    })
  })

  test('should convert DatetimeLocal Zod schema to JSON schema (output)', async () => {
    const datetimeLocalSchema = z.object({
      d: z.datetimeLocal(),
    })
    const jsonSchema = await outputZodToSchema(datetimeLocalSchema)
    expect(jsonSchema).toEqual({
      ...OUTPUT_DEFINITIONS,
      type: 'object',
      properties: {
        d: {
          $ref: '#/$defs/DatetimeLocal',
        },
      },
      required: ['d'],
    })
  })
})
