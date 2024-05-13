import { z } from 'zod'

const BASE64_DATA_URL = z
  .string()
  .regex(/^data:[^;]*;base64,[-A-Za-z0-9+/]+={0,3}$/)

export const BASE64_DATA_URL_TO_BASE64 = BASE64_DATA_URL.transform<string>(
  (url) => url.split('base64,').pop()!,
)
