import { IMAGE_INPUT, IMAGE_OUTPUT } from '../../atoms/image'

describe('IMAGE_INPUT', () => {
  it('should validate a valid image input object', () => {
    const validInput = {
      name: 'image.png',
      content_type: 'image/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    };

    expect(IMAGE_INPUT.safeParse(validInput).success).toBe(true)
  })

  it('should validate an image input object with optional name', () => {
    const validInput = {
      content_type: 'image/jpeg',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    };

    expect(IMAGE_INPUT.safeParse(validInput).success).toBe(true)
  })

  it('should fail validation for missing content_type', () => {
    const invalidInput = {
      name: 'image.jpg',
      data: 'base64encodeddata',
    }

    expect(IMAGE_INPUT.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for invalid content_type', () => {
    const invalidInput = {
      name: 'image.gif',
      content_type: 'image/svg',
      data: 'base64encodeddata',
    }

    expect(IMAGE_INPUT.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for missing data', () => {
    const invalidInput = {
      name: 'image.jpg',
      content_type: 'image/jpeg',
    }

    expect(IMAGE_INPUT.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for invalid data', () => {
    const invalidInput = {
      name: 'image.png',
      content_type: 'image/png',
      data: 12345,
    }

    expect(IMAGE_INPUT.safeParse(invalidInput).success).toBe(false)
  })
})

describe('IMAGE_OUTPUT', () => {
  it('should validate a valid image output object', () => {
    const validOutput = {
      name: 'image.jpg',
      content_type: 'image/jpeg',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    }

    expect(IMAGE_OUTPUT.safeParse(validOutput).success).toBe(true)
  })

  it('should validate an image output object with optional name', () => {
    const validOutput = {
      content_type: 'image/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    }

    expect(IMAGE_OUTPUT.safeParse(validOutput).success).toBe(true)
  })

  it('should fail validation when passing a buffer', () => {
    const invalidOutput = {
      name: 'image.png',
      content_type: 'image/png',
      data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', 'base64'),
    }

    expect(IMAGE_OUTPUT.safeParse(invalidOutput).success).toBe(false)
  })

  it('should fail validation for missing content_type', () => {
    const invalidOutput = {
      name: 'image.gif',
      data: Buffer.from('base64encodeddata', 'base64'),
    }

    expect(IMAGE_OUTPUT.safeParse(invalidOutput).success).toBe(false)
  })

  it('should fail validation for invalid content_type', () => {
    const invalidOutput = {
      name: 'image.png',
      content_type: 'image/svg',
      data: Buffer.from('base64encodeddata', 'base64'),
    }

    expect(IMAGE_OUTPUT.safeParse(invalidOutput).success).toBe(false)
  })

  it('should fail validation for missing data', () => {
    const invalidOutput = {
      name: 'image.jpg',
      content_type: 'image/jpeg',
    }

    expect(IMAGE_OUTPUT.safeParse(invalidOutput).success).toBe(false)
  })

  it('should fail validation for invalid data', () => {
    const invalidOutput = {
      name: 'image.png',
      content_type: 'image/png',
      data: 'base64encodeddata',
    }

    expect(IMAGE_OUTPUT.safeParse(invalidOutput).success).toBe(false)
  })
})