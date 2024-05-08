import { z } from 'zod'

export const bufferSchema = z.union([
  z.instanceof(Buffer),
  z
    .instanceof(ArrayBuffer)
    .transform<Buffer>((arrBuff) => Buffer.from(arrBuff)),
])

export const bufferToBase64Schema = z
  .union([bufferSchema, z.promise(bufferSchema)])
  .transform<string>(async (buf) => (await buf).toString('base64'))

export const base64ToBufferSchema = z
  .string()
  .base64()
  .transform<Buffer>((b64) => Buffer.from(b64, 'base64'))
