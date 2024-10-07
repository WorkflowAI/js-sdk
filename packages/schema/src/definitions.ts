import { DATETIME_LOCAL } from './atoms/datetime-local.js'
import { FILE } from './atoms/file.js'
import { IMAGE } from './atoms/image.js'

// definitions must maintain the same order as the extensions or the test
// for exhaustive definitions will fail

/**
 * The definitions for the schema
 */
export const definitions = {
  Image: IMAGE,
  DatetimeLocal: DATETIME_LOCAL,
  File: FILE,
}
