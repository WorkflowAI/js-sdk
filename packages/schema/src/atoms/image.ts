import { z } from 'zod'

import { BASE64_TO_BUFFER, BUFFER_TO_BASE64 } from './buffer'
import { BASE64_DATA_URL_TO_BASE64 } from './data-url'
import { resolved } from './promise'

/**
 * Represents the content types for images.
 */
const IMAGE_CONTENT_TYPE = z.enum([
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/tiff',
  'image/gif',
])

/**
 * Represents an image input.
 */
export const IMAGE_INPUT = z.object({
  /**
   * An optional name for the image.
   */
  name: z.string().optional().describe('An optional name'),
  /**
   * The content type of the image.
   */
  content_type: IMAGE_CONTENT_TYPE.describe('The content type of the image'),
  /**
   * The Buffer or base64 encoded data of the image.
   */
  data: resolved(
    z.union([z.string().base64(), BASE64_DATA_URL_TO_BASE64, BUFFER_TO_BASE64]),
  ).describe('The Buffer or base64 encoded data of the image'),
})

/**
 * Represents the output structure for an image.
 */
export const IMAGE_OUTPUT = z.object({
  /**
   * An optional name for the image.
   */
  name: z.string().optional().describe('An optional name'),
  /**
   * The content type of the image.
   */
  content_type: IMAGE_CONTENT_TYPE.describe('The content type of the image'),
  /**
   * The data of the image as a Buffer.
   */
  data: BASE64_TO_BUFFER.describe('The data of the image as Buffer'),
})
