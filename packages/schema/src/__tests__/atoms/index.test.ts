import * as bufferExports from '../../atoms/buffer';
import * as datetimeLocalExports from '../../atoms/datetime-local';
import * as imageExports from '../../atoms/image';
import * as indexExports from '../../atoms/index';

describe('index exports', () => {
  it('should re-export everything from buffer', () => {
    expect(Object.keys(indexExports)).toEqual(expect.arrayContaining(Object.keys(bufferExports)));
  });

  it('should re-export everything from datetime-local', () => {
    expect(Object.keys(indexExports)).toEqual(expect.arrayContaining(Object.keys(datetimeLocalExports)));
  });

  it('should re-export everything from image', () => {
    expect(Object.keys(indexExports)).toEqual(expect.arrayContaining(Object.keys(imageExports)));
  });
});