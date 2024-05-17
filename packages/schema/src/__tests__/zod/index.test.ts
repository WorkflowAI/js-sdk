import * as indexExports from '../../zod/index';
import * as zodExports from '../../zod/zod';

describe('index exports', () => {
  it('should re-export everything from zod', () => {
    expect(Object.keys(indexExports.z)).toEqual(Object.keys(zodExports));
  });
});