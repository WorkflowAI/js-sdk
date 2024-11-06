import { z } from 'zod';

/**
 * Represents a local datetime, with a date, local time, and timezone.
 */
export const DATETIME_LOCAL = z
  .object({
    /**
     * The date of the local datetime.
     */
    date: z.string().date().describe('The date of the local datetime.'),

    /**
     * The time of the local datetime without timezone info.
     */
    local_time: z
      .string()
      .time()
      .describe('The time of the local datetime without timezone info.'),

    /**
     * The timezone of the local time.
     */
    timezone: z.string().describe('The timezone of the local time.'),
  })
  .describe(
    'This class represents a local datetime, with a datetime and a timezone.'
  );
