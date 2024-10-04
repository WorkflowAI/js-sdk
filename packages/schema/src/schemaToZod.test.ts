import { JsonSchemaObject } from 'json-schema-to-zod'

import { inputSchemaToZod, outputSchemaToZod } from './schemaToZod.js'

const INPUT_DEFINITIONS = {
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
  File: {
    additionalProperties: false,
    properties: {
      content_type: {
        description: 'The content type of the file',
        enum: [
          'image/png',
          'image/jpg',
          'image/jpeg',
          'image/webp',
          'image/tiff',
          'image/gif',
          'application/pdf',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/flac',
          'audio/aac',
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
            $ref: '#/$defs/File/properties/data/anyOf/0',
          },
        ],
        description: 'The Buffer or base64 encoded data of the file',
      },
      name: {
        description: 'An optional name',
        type: 'string',
      },
    },
    required: ['content_type', 'data'],
    type: 'object',
  },
}

const OUTPUT_DEFINITIONS = {
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
  File: {
    additionalProperties: false,
    properties: {
      content_type: {
        description: 'The content type of the file',
        enum: [
          'image/png',
          'image/jpg',
          'image/jpeg',
          'image/webp',
          'image/tiff',
          'image/gif',
          'application/pdf',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/flac',
          'audio/aac',
        ],
        type: 'string',
      },
      data: {
        contentEncoding: 'base64',
        description: 'The data of the file as Buffer',
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
}

describe('schemaToZod', () => {
  it('inputSchemaToZod should convert JSON schema with definitions to Zod schema', async () => {
    const mockJsonSchema: JsonSchemaObject = {
      $ref: '#/definitions/person',
      type: 'object',
      properties: {
        p: { $ref: '#/definitions/person' },
      },
      definitions: {
        person: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { $ref: '#/definitions/address' },
          },
          required: ['name', 'address'],
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
          },
          required: ['street', 'city', 'state'],
        },
      },
    }

    const zodSchema = await inputSchemaToZod(mockJsonSchema)
    expect(zodSchema).toBe(
      `z.object({ "p": z.object({ "name": z.string(), "address": z.object({ "street": z.string(), "city": z.string(), "state": z.string() }) }).optional() })`,
    )
  })

  it('outputSchemaToZod should convert JSON schema with datetimeLocal definition to Zod schema', async () => {
    const mockJsonSchema: JsonSchemaObject = {
      $ref: '#/definitions/event',
      type: 'object',
      properties: {
        e: { $ref: '#/definitions/event' },
      },
      definitions: {
        event: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            date: { $ref: '#/definitions/datetimeLocal' },
          },
          required: ['name', 'date'],
        },
        datetimeLocal: {
          type: 'string',
          format: 'date-time',
        },
      },
    }
    const zodSchema = await outputSchemaToZod(mockJsonSchema)
    expect(zodSchema).toBe(
      `z.object({ "e": z.object({ "name": z.string(), "date": z.string().datetime({ offset: true }) }).optional() })`,
    )
  })

  describe('DatetimeLocal', () => {
    it('inputSchemaToZod should convert JSON schema with datetimeLocal definition to Zod schema', async () => {
      const mockJsonSchema: JsonSchemaObject = {
        type: 'object',
        properties: {
          e: { $ref: '#/$defs/event' },
        },
        $defs: {
          ...INPUT_DEFINITIONS,
          event: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              date: { $ref: '#/$defs/DatetimeLocal' },
            },
            required: ['name', 'date'],
          },
        },
      }
      const zodSchema = await inputSchemaToZod(mockJsonSchema)
      expect(zodSchema).toBe(
        `z.object({ "e": z.object({ "name": z.string(), "date": z.datetimeLocal() }).optional() })`,
      )
    })

    it('outputSchemaToZod should convert JSON schema with datetimeLocal definition to Zod schema', async () => {
      const mockJsonSchema: JsonSchemaObject = {
        type: 'object',
        properties: {
          e: { $ref: '#/$defs/event' },
        },
        $defs: {
          ...INPUT_DEFINITIONS,
          event: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              date: { $ref: '#/$defs/DatetimeLocal' },
            },
            required: ['name', 'date'],
          },
        },
      }
      const zodSchema = await outputSchemaToZod(mockJsonSchema)
      expect(zodSchema).toBe(
        `z.object({ "e": z.object({ "name": z.string(), "date": z.datetimeLocal() }).optional() })`,
      )
    })
  })

  describe('Image', () => {
    it('inputSchemaToZod should convert JSON schema with Image definition to Zod schema', async () => {
      const mockJsonSchema: JsonSchemaObject = {
        type: 'object',
        properties: {
          i: { $ref: '#/$defs/Image' },
        },
        $defs: {
          ...INPUT_DEFINITIONS,
        },
      }
      const zodSchema = await inputSchemaToZod(mockJsonSchema)
      expect(zodSchema).toBe(`z.object({ "i": z.imageInput().optional() })`)
    })

    it('outputSchemaToZod should convert JSON schema with Image definition to Zod schema', async () => {
      const mockJsonSchema: JsonSchemaObject = {
        type: 'object',
        properties: {
          i: { $ref: '#/$defs/Image' },
        },
        $defs: {
          ...OUTPUT_DEFINITIONS,
        },
      }
      const zodSchema = await outputSchemaToZod(mockJsonSchema)
      expect(zodSchema).toBe(`z.object({ "i": z.imageOutput().optional() })`)
    })
  })
})

describe('File', () => {
  it('inputSchemaToZod should convert JSON schema with File definition to Zod schema', async () => {
    const mockJsonSchema: JsonSchemaObject = {
      type: 'object',
      properties: {
        i: { $ref: '#/$defs/File' },
      },
      $defs: {
        ...INPUT_DEFINITIONS,
      },
    }
    const zodSchema = await inputSchemaToZod(mockJsonSchema)
    expect(zodSchema).toBe(`z.object({ "i": z.fileInput().optional() })`)
  })

  it('outputSchemaToZod should convert JSON schema with Image definition to Zod schema', async () => {
    const mockJsonSchema: JsonSchemaObject = {
      type: 'object',
      properties: {
        i: { $ref: '#/$defs/File' },
      },
      $defs: {
        ...OUTPUT_DEFINITIONS,
      },
    }
    const zodSchema = await outputSchemaToZod(mockJsonSchema)
    expect(zodSchema).toBe(`z.object({ "i": z.fileOutput().optional() })`)
  })
})
