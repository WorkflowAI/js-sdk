import { z } from 'zod'

export const resolved = <S extends z.ZodTypeAny>(schema: S) =>
  z.union([schema, schema.promise().transform(async (v) => await v)])
