import { DATETIME_LOCAL, IMAGE_INPUT, IMAGE_OUTPUT } from '../atoms/index.js'
import { datetimeLocal, imageInput, imageOutput } from './extensions.js'

describe('Extensions', () => {
  it('imageInput should return IMAGE_INPUT', () => {
    const result = imageInput()
    expect(result).toBe(IMAGE_INPUT)
  })

  it('imageOutput should return IMAGE_OUTPUT', () => {
    const result = imageOutput()
    expect(result).toBe(IMAGE_OUTPUT)
  })

  it('datetimeLocal should return DATETIME_LOCAL', () => {
    const result = datetimeLocal()
    expect(result).toBe(DATETIME_LOCAL)
  })
})
