import { FILE } from './file.js';

describe('FILE', () => {
  it('should validate a valid FILE input object', () => {
    const validInput = {
      name: 'FILE.png',
      content_type: 'image/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    };

    expect(FILE.safeParse(validInput).success).toBe(true);
  });

  it('should validate an FILE input object with url', () => {
    const validInput = {
      url: 'https://example.com/FILE.png',
    };

    expect(FILE.safeParse(validInput).success).toBe(true);
  });

  it('should validate an FILE input object with optional name', () => {
    const validInput = {
      content_type: 'image/jpeg',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    };

    expect(FILE.safeParse(validInput).success).toBe(true);
  });

  it('should fail validation for missing content_type', () => {
    const invalidInput = {
      name: 'FILE.jpg',
      data: 'base64encodeddata',
    };

    expect(FILE.safeParse(invalidInput).success).toBe(false);
  });

  it('should fail validation for invalid content_type', () => {
    const invalidInput = {
      name: 'FILE.gif',
      content_type: 'image/svg',
      data: 'base64encodeddata',
    };

    expect(FILE.safeParse(invalidInput).success).toBe(false);
  });

  it('should fail validation for missing data', () => {
    const invalidInput = {
      name: 'FILE.jpg',
      content_type: 'image/jpeg',
    };

    expect(FILE.safeParse(invalidInput).success).toBe(false);
  });

  it('should fail validation for invalid data', () => {
    const invalidInput = {
      name: 'FILE.png',
      content_type: 'image/png',
      data: 12345,
    };

    expect(FILE.safeParse(invalidInput).success).toBe(false);
  });

  it('allows any string as content_type', () => {
    const validInput = {
      name: 'FILE.png',
      content_type: 'image/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    };

    expect(FILE.safeParse(validInput).success).toBe(true);
  });
});
