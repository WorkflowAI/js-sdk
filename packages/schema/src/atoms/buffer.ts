import { z } from 'zod';

/**
 * Represents a union of Buffer and ArrayBuffer types.
 */
export const BUFFER = z.union([
  z.instanceof(Buffer),
  z
    .instanceof(ArrayBuffer)
    .transform<Buffer>((arrBuff) => Buffer.from(arrBuff)),
]);

/**
 * Represents a Zod transform that converts a Buffer to a base64 string.
 */
export const BUFFER_TO_BASE64 = BUFFER.transform<string>((buf) =>
  buf.toString('base64')
);

/**
 * Represents a Zod transform that converts a base64 string to a Buffer.
 */
export const BASE64_TO_BUFFER = z
  .string()
  .base64()
  .transform<Buffer>((b64) => Buffer.from(b64, 'base64'));
