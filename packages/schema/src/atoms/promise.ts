import { z } from 'zod';

/**
 * Creates a new Zod schema that represents a resolved promise.
 *
 * @param schema - The Zod schema to create a resolved promise from.
 * @returns A new Zod schema that represents a resolved promise.
 */
export const resolved = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([schema, schema.promise().transform(async (v) => await v)]);
