import { sliceIndexes, highlight, removeDiacritics } from '@/utils/strings.js'
import { escape } from 'lodash'

describe('sliceIndexes', () => {
  it('should return empty list when input is empty string', () => {
    expect(sliceIndexes('', [])).to.eql([])
    expect(sliceIndexes('', [1, 3])).to.eql([])
  })

  it('should return the whole string when indexes are empty', () => {
    expect(sliceIndexes('a string', [])).to.eql(['a string'])
  })

  it('should return two parts when given [0]', () => {
    expect(sliceIndexes('a string', [0])).to.eql(['', 'a string'])
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

  it('should split the string in three with 0 in two indexes', () => {
    expect(sliceIndexes('a string', [0, 2])).to.eql(['', 'a ', 'string'])
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

describe('highlight', () => {
  it('should return original string when mark list is empty', () => {
    expect(highlight('string', [])).to.equal('string')
  })

  it('should return one mark at the beginning of the string', () => {
    expect(highlight('say hi to the world', [{content: 'say', index: 0}])).to.equal('<mark>say</mark> hi to the world')
  })

  it('should return one mark', () => {
    expect(highlight('say hi to the world', [{content: 'hi', index: 4}])).to.equal('say <mark>hi</mark> to the world')
  })

  it('should return 3 marks', () => {
    expect(highlight('say hi to the world', [{content: 'say', index: 0}, {content: 'hi', index: 4}, {content: 'world', index: 14}]))
      .to.equal('<mark>say</mark> <mark>hi</mark> to the <mark>world</mark>')
  })

  it('should return one mark with custom mark function', () => {
    expect(highlight('say hi to the world', [{content: 'hi', category: 'cat', index: 4}], m => `<b class="${m.category}">${m.content}</b>`))
      .to.equal('say <b class="cat">hi</b> to the world')
  })

  it('should return one mark with custom rest function', () => {
    expect(highlight('say hi to </the> world', [{content: 'hi', index: 4}], m => m.content, r => escape(r)))
      .to.equal('say hi to &lt;/the&gt; world')
  })
})

describe('removeDiacritics', () => {
  it('replace nothing on an empty string', () => {
    expect(removeDiacritics('')).to.equal('')
  })

  it('replace è, û and é', () => {
    expect(removeDiacritics('Crème brûlée')).to.equal('Creme brulee')
  })
})
