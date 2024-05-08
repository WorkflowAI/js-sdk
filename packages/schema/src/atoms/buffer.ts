import { z } from 'zod'

export const buffer = z.union([
  z.instanceof(Buffer),
  z
    .instanceof(ArrayBuffer)
    .transform<Buffer>((arrBuff) => Buffer.from(arrBuff)),
])

export const bufferToBase64 = z
  .union([buffer, z.promise(buffer)])
  .transform<string>(async (buf) => (await buf).toString('base64'))

export const base64ToBuffer = z
  .string()
  .base64()
  .transform<Buffer>((b64) => Buffer.from(b64, 'base64'))
