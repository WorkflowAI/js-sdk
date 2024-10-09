import { definitions } from './definitions.js';
import * as extensions from './zod/extensions.js';

describe('definitions', () => {
  it('is exhaustive', () => {
    const defValues = Object.values(definitions);
    const extValues = Object.values(extensions);

    expect(defValues.length).toBe(extValues.length);

    defValues.forEach((defValue, index) => {
      expect(defValue).toBe(extValues[index]());
    });
  });
});
