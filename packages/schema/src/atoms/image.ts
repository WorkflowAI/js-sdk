import { z } from 'zod'

import { base64ToBufferSchema, bufferToBase64Schema } from './buffer'

const imageContentType = z.enum([
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/tiff',
  'image/gif',
])

const imageInput = z.object({
  name: z.string().optional().describe('An optional name'),
  content_type: imageContentType.describe('The content type of the image'),
  data: bufferToBase64Schema.describe('The base64 encoded data of the image'),
})

const imageOutput = z.object({
  name: z.string().optional().describe('An optional name'),
  content_type: imageContentType.describe('The content type of the image'),
  data: base64ToBufferSchema.describe('The base64 encoded data of the image'),
})

export const definitions = {
  Image: {
    input: 'imageInput',
    output: 'imageOutput',
  },
}

export const zodExtensions = {
  imageInput,
  imageOutput,
}
