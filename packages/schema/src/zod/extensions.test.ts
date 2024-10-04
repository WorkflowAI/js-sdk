import { DATETIME_LOCAL, IMAGE_INPUT, IMAGE_OUTPUT, FILE_INPUT, FILE_OUTPUT } from '../atoms/index.js'
import { datetimeLocal, imageInput, imageOutput, fileInput, fileOutput } from './extensions.js'

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

it('fileInput should return FILE_INPUT', () => {
  const result = fileInput()
  expect(result).toBe(FILE_INPUT)
})

it('fileOutput should return FILE_OUTPUT', () => {
  const result = fileOutput()
    expect(result).toBe(FILE_OUTPUT)
  })

