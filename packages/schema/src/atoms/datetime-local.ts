import { z } from 'zod'

export const DATETIME_LOCAL = z
  .object({
    date: z.string().date().describe('The date of the local datetime.'),
    local_time: z
      .string()
      .time()
      .describe('The time of the local datetime without timezone info.'),
    timezone: z.string().describe('The timezone of the local time.'),
  })
  .describe(
    'This class represents a local datetime, with a datetime and a timezone.',
  )
