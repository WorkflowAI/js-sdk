import { z } from 'zod'

export const BUFFER = z.union([
  z.instanceof(Buffer),
  z
    .instanceof(ArrayBuffer)
    .transform<Buffer>((arrBuff) => Buffer.from(arrBuff)),
])

export const BUFFER_TO_BASE64 = z
  .union([BUFFER, z.promise(BUFFER)])
  .transform<string>(async (buf) => (await buf).toString('base64'))

export const BASE64_TO_BUFFER = z
  .string()
  .base64()
  .transform<Buffer>((b64) => Buffer.from(b64, 'base64'))
