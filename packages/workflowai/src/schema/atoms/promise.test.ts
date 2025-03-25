import { z } from 'zod';
import { resolved } from './promise.js';

describe('resolved function', () => {
  it('should resolve a promise', async () => {
    const schema = z.string();
    const resolvedSchema = resolved(schema);
    const promise = Promise.resolve('test');
    const result = await resolvedSchema.parseAsync(promise);
    expect(result).toBe('test');
  });

  it('should pass through non-promise values', async () => {
    const schema = z.string();
    const resolvedSchema = resolved(schema);
    const result = await resolvedSchema.parseAsync('test');
    expect(result).toBe('test');
  });

  it('should reject non-conforming values', async () => {
    const schema = z.string();
    const resolvedSchema = resolved(schema);
    try {
      await resolvedSchema.parseAsync(123);
    } catch (e) {
      expect(e instanceof z.ZodError).toBe(true);
    }
  });
});
