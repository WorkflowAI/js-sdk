import { Schemas } from '@workflowai/api';
import type { XOR } from 'ts-xor';

type NotNullValue<T> = T extends null ? never : T;
type NotNullProperties<T extends Record<string, unknown>> = Required<{
  [K in keyof T]: NotNullValue<T[K]>;
}>;

export type GroupReference = XOR<
  Pick<NotNullProperties<Schemas['TaskGroupReference']>, 'id'>,
  Pick<NotNullProperties<Schemas['TaskGroupReference']>, 'iteration'>,
  Pick<NotNullProperties<Schemas['TaskGroupReference']>, 'properties'>,
  Pick<NotNullProperties<Schemas['TaskGroupReference']>, 'alias'>,
  {
    environment: 'production' | string;
  }
>;

export function isGroupReference(
  group: GroupReference | null | undefined
): group is GroupReference {
  return !!group;
}

export function sanitizeGroupReference(
  group: GroupReference
): Schemas['TaskGroupReference'];
export function sanitizeGroupReference(group: null | undefined): typeof group;
export function sanitizeGroupReference(
  group: GroupReference | null | undefined
): Schemas['TaskGroupReference'] | typeof group {
  if (!isGroupReference(group)) {
    return null;
  }

  if ('environment' in group) {
    return {
      alias: `environment=${group.environment}`,
    };
  }

  return group;
}
