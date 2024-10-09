import * as extensions from './extensions.js';
import * as zodExports from './zod.js';

describe('zod exports', () => {
  it('should re-export everything from extensions', () => {
    expect(Object.keys(zodExports)).toEqual(
      expect.arrayContaining(Object.keys(extensions))
    );
  });
});
