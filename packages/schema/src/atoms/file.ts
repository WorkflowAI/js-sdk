import { z } from 'zod'

import { BASE64_TO_BUFFER, BUFFER_TO_BASE64 } from './buffer.js'
import { BASE64_DATA_URL_TO_BASE64 } from './data-url.js'
import { resolved } from './promise.js'

/**
 * Represents the content types for files.
 */
const FILE_CONTENT_TYPE = z.enum([
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
])

/**
 * Represents an file input.
 */
export const FILE_INPUT = z.object({
  /**
   * An optional name for the file.
   */
  name: z.string().optional().describe('An optional name'),
  /**
   * The content type of the file.
   */
  content_type: FILE_CONTENT_TYPE.describe('The content type of the file'),
  /**
   * The Buffer or base64 encoded data of the file.
   */
  data: resolved(
    z.union([z.string().base64(), BASE64_DATA_URL_TO_BASE64, BUFFER_TO_BASE64]),
  ).describe('The Buffer or base64 encoded data of the file'),
})

/**
 * Represents the output structure for an file.
 */
export const FILE_OUTPUT = z.object({
  /**
   * An optional name for the file.
   */
  name: z.string().optional().describe('An optional name'),
  /**
   * The content type of the file.
   */
  content_type: FILE_CONTENT_TYPE.describe('The content type of the file'),
  /**
   * The data of the file as a Buffer.
   */
  data: BASE64_TO_BUFFER.describe('The data of the file as Buffer'),
})
