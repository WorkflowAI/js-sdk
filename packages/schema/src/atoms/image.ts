import { z } from 'zod'

import { BASE64_TO_BUFFER, BUFFER_TO_BASE64 } from './buffer'

const IMAGE_CONTENT_TYPE = z.enum([
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/tiff',
  'image/gif',
])

export const IMAGE_INPUT = z.object({
  name: z.string().optional().describe('An optional name'),
  content_type: IMAGE_CONTENT_TYPE.describe('The content type of the image'),
  data: BUFFER_TO_BASE64.describe('The base64 encoded data of the image'),
})

export const IMAGE_OUTPUT = z.object({
  name: z.string().optional().describe('An optional name'),
  content_type: IMAGE_CONTENT_TYPE.describe('The content type of the image'),
  data: BASE64_TO_BUFFER.describe('The base64 encoded data of the image'),
})
