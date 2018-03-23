import {sliceIndexes} from '@/utils/strings.js'

describe('sliceIndexes', () => {
  it('should return empty list when input is empty string', () => {
    expect(sliceIndexes('', [])).to.eql([])
    expect(sliceIndexes('', [1, 3])).to.eql([])
  })

  it('should return the whole string when indexes are empty', () => {
    expect(sliceIndexes('a string', [])).to.eql(['a string'])
  })

  it('should return the whole string when given [0]', () => {
    expect(sliceIndexes('a string', [0])).to.eql(['a string'])
  })

  it('should return the whole string if indexes are outside the string', () => {
    expect(sliceIndexes('a string', [-1])).to.eql(['a string'])
    expect(sliceIndexes('a string', [9])).to.eql(['a string'])
    expect(sliceIndexes('a string', [-2, 10])).to.eql(['a string'])
  })

  it('should split the string in two when index is inside the string', () => {
    expect(sliceIndexes('a string', [1])).to.eql(['a', ' string'])
    expect(sliceIndexes('a string', [7])).to.eql(['a strin', 'g'])
  })

  it('should split the string in two when two indexes are equal', () => {
    expect(sliceIndexes('a string', [1, 1, 1])).to.eql(['a', ' string'])
    expect(sliceIndexes('a string', [7, 7])).to.eql(['a strin', 'g'])
  })

  it('should split the string in three when two indexes are inside the string', () => {
    expect(sliceIndexes('a string', [1, 2])).to.eql(['a', ' ', 'string'])
    expect(sliceIndexes('a string', [1, 7])).to.eql(['a', ' strin', 'g'])
  })

  it('should split the string in three when indexes are not ordered', () => {
    expect(sliceIndexes('a string', [2, 1])).to.eql(['a', ' ', 'string'])
    expect(sliceIndexes('a string', [7, 1])).to.eql(['a', ' strin', 'g'])
  })

  it('should split the string in 9 parts', () => {
    expect(sliceIndexes('a string that will be cut at each space', [1, 8, 13, 18, 21, 25, 28, 33]))
      .to.eql(['a', ' string', ' that', ' will', ' be', ' cut', ' at', ' each', ' space'])
  })
})
