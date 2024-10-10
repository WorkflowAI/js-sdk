import { z } from './zod/index.js';
import { inputZodToSchema, outputZodToSchema } from './zodToSchema.js';

describe('zodToSchema', () => {
  test('should convert input Zod schema to JSON schema', async () => {
    const inputSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const jsonSchema = await inputZodToSchema(inputSchema);

    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
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
    });
  });

  test('should convert image Zod schema to JSON schema', async () => {
    const imageSchema = z.object({
      i: z.image(),
    });
    const jsonSchema = await inputZodToSchema(imageSchema);
    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
      type: 'object',
      properties: {
        i: {
          $ref: '#/$defs/Image',
        },
      },
      required: ['i'],
    });
  });

  test('should convert DatetimeLocal Zod schema to JSON schema', async () => {
    const datetimeLocalSchema = z.object({
      d: z.datetimeLocal(),
    });
    const jsonSchema = await inputZodToSchema(datetimeLocalSchema);
    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
      type: 'object',
      properties: {
        d: {
          $ref: '#/$defs/DatetimeLocal',
        },
      },
      required: ['d'],
    });
  });

  test('should convert output Zod schema to JSON schema', async () => {
    const outputSchema = z.object({
      success: z.boolean(),
      message: z.string(),
    });

    const jsonSchema = await outputZodToSchema(outputSchema);

    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
      required: ['success', 'message'],
    });
  });

  test('should convert DatetimeLocal Zod schema to JSON schema (output)', async () => {
    const datetimeLocalSchema = z.object({
      d: z.datetimeLocal(),
    });
    const jsonSchema = await outputZodToSchema(datetimeLocalSchema);
    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
      type: 'object',
      properties: {
        d: {
          $ref: '#/$defs/DatetimeLocal',
        },
      },
      required: ['d'],
    });
  });

  test('should convert File Zod schema to JSON schema', async () => {
    const fileSchema = z.object({
      f: z.file(),
    });
    const jsonSchema = await inputZodToSchema(fileSchema);
    expect(jsonSchema).toEqual({
      $defs: {},
      additionalProperties: false,
      type: 'object',
      properties: {
        f: {
          $ref: '#/$defs/File',
        },
      },
      required: ['f'],
    });
  });
});
