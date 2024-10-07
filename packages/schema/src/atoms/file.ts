import { z } from 'zod'

import { BUFFER_TO_BASE64 } from './buffer.js'
import { BASE64_DATA_URL_TO_BASE64 } from './data-url.js'
import { resolved } from './promise.js'

/**
 * Represents the content types for images.
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
  'audio/mp4',
  'audio/mp3',
  'audio/m4a',
  'audio/m4b',
])

/**
 * Represents an image input.
 */
export const FILE = z
  .object({
    /**
     * An optional name for the image.
     */
    name: z.string().optional().describe('An optional name (deprecated)'),
    /**
     * The content type of the image.
     */
    content_type: z
      .union([z.string(), FILE_CONTENT_TYPE])
      .describe('The content type')
      .optional(),
    /**
     * The Buffer or base64 encoded data of the image.
     */
    data: resolved(
      z.union([
        z.string().base64(),
        BASE64_DATA_URL_TO_BASE64,
        BUFFER_TO_BASE64,
      ]),
    )
      .describe('The Buffer or base64 encoded data of the file')
      .optional(),
    url: z.string().url().optional().describe('A public URL to the file'),
  })
  .refine(
    (data) => {
      if (data.url) {
        return true
      }
      return data.content_type !== undefined && data.data !== undefined
    },
    {
      message:
        'Either content_type and data must be provided if url is not provided',
      path: ['content_type', 'data'],
    },
  )
