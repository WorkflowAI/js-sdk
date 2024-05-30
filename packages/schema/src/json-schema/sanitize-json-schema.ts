import { JsonSchemaObject } from 'json-schema-to-zod'

export const sanitize = (obj: JsonSchemaObject): JsonSchemaObject => {
  if (!('type' in obj)) {
    if (
      'properties' in obj ||
      'patternProperties' in obj ||
      'propertyNames' in obj ||
      'minProperties' in obj ||
      'maxProperties' in obj
    ) {
      obj.type = 'object'
    } else if (
      'items' in obj ||
      'prefixItems' in obj ||
      'contains' in obj ||
      'uniqueItems' in obj ||
      'minItems' in obj ||
      'maxItems' in obj
    ) {
      obj.type = 'array'
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value != null) {
      obj[key] = sanitize(value)
    }
  }

  return obj
}
