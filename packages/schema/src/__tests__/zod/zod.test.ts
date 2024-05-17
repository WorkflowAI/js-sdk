import * as extensions from '../../zod/extensions';
import * as zodExports from '../../zod/zod';

describe('zod exports', () => {
  it('should re-export everything from extensions', () => {
    expect(Object.keys(zodExports)).toEqual(expect.arrayContaining(Object.keys(extensions)));
  });
});