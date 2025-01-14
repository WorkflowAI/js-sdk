import { z } from 'zod';

/**
 * Represents a base64-encoded data URL.
 */
const BASE64_DATA_URL = z
  .string()
  .regex(/^data:[^;]*;base64,[-A-Za-z0-9+/]+={0,3}$/);

/**
 * Transforms a base64-encoded data URL to its base64 representation.
 * @param url - The base64-encoded data URL.
 * @returns The base64 representation of the data URL.
 */
export const BASE64_DATA_URL_TO_BASE64 = BASE64_DATA_URL.transform<string>(
  (url) => z.string().base64().parse(url.split('base64,').pop()!)
);
