import * as datetimeLocal from './datetime-local'
import * as image from './image'

export const definitions = {
  ...image.definitions,
  ...datetimeLocal.definitions,
}

export const zodExtensions = {
  ...image.zodExtensions,
  ...datetimeLocal.zodExtensions,
}
