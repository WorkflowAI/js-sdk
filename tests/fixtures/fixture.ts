import { join } from 'path';

export function fixturePath(name: string) {
  return join(__dirname, name);
}
