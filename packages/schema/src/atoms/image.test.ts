import { IMAGE } from './image.js'

describe('IMAGE', () => {
  it('should validate a valid IMAGE input object', () => {
    const validInput = {
      name: 'IMAGE.png',
      content_type: 'IMAGE/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    }

    expect(IMAGE.safeParse(validInput).success).toBe(true)
  })

  it('should validate an IMAGE input object with url', () => {
    const validInput = {
      url: 'https://example.com/IMAGE.png',
    }

    expect(IMAGE.safeParse(validInput).success).toBe(true)
  })

  it('should validate an IMAGE input object with optional name', () => {
    const validInput = {
      content_type: 'IMAGE/jpeg',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    }

    expect(IMAGE.safeParse(validInput).success).toBe(true)
  })

  it('should fail validation for missing content_type', () => {
    const invalidInput = {
      name: 'IMAGE.jpg',
      data: 'base64encodeddata',
    }

    expect(IMAGE.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for invalid content_type', () => {
    const invalidInput = {
      name: 'IMAGE.gif',
      content_type: 'IMAGE/svg',
      data: 'base64encodeddata',
    }

    expect(IMAGE.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for missing data', () => {
    const invalidInput = {
      name: 'IMAGE.jpg',
      content_type: 'IMAGE/jpeg',
    }

    expect(IMAGE.safeParse(invalidInput).success).toBe(false)
  })

  it('should fail validation for invalid data', () => {
    const invalidInput = {
      name: 'IMAGE.png',
      content_type: 'IMAGE/png',
      data: 12345,
    }

    expect(IMAGE.safeParse(invalidInput).success).toBe(false)
  })

  it('allows any string as content_type', () => {
    const validInput = {
      name: 'IMAGE.png',
      content_type: 'IMAGE/png',
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==', // a 1x1 red dot
    }

    expect(IMAGE.safeParse(validInput).success).toBe(true)
  })
})
