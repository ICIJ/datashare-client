import { Text } from '@codemirror/state'

import { CHUNK_LENGTH, buildSearchIndex, findIndexMatches } from '@/utils/codeSearchIndex'
import { findFoldedMatches } from '@/utils/strings'

vi.mock('@/utils/strings', async (importOriginal) => {
  const strings = await importOriginal()
  return { ...strings, findFoldedMatches: vi.fn(strings.findFoldedMatches) }
})

function search(source, term) {
  const doc = Text.of(source.split('\n'))
  return findIndexMatches(buildSearchIndex(doc), doc, term)
}

describe('codeSearchIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('finds matches across lines, ignoring case and accents', () => {
    expect(search('Crème\nfoo CREME crème', 'creme')).toEqual([
      { from: 0, to: 5 },
      { from: 10, to: 15 },
      { from: 16, to: 21 }
    ])
  })

  it('finds a Greek word ending with a capital sigma', () => {
    expect(search('ΟΔΟΣ', 'οδοσ')).toEqual([{ from: 0, to: 4 }])
  })

  it.each([
    ['ΟΔΟΣ', 'οδος'],
    ['οδος', 'ΟΔΟΣ']
  ])('finds the Greek word %s when searching %s', (source, term) => {
    expect(search(source, term)).toEqual([{ from: 0, to: 4 }])
  })

  it('finds every match after an emoji', () => {
    expect(search('\u{1F600}\u{1F600}abc abc\nabc', 'abc')).toEqual([
      { from: 4, to: 7 },
      { from: 8, to: 11 },
      { from: 12, to: 15 }
    ])
  })

  it('finds nothing for a term that folds to nothing', () => {
    expect(search('créme', '́')).toEqual([])
  })

  it('finds a match that crosses a chunk boundary of a long line', () => {
    const source = 'a'.repeat(CHUNK_LENGTH - 3) + 'needle' + 'a'.repeat(CHUNK_LENGTH)
    expect(search(source, 'needle')).toEqual([{ from: CHUNK_LENGTH - 3, to: CHUNK_LENGTH + 3 }])
  })

  it('finds a match in the last chunk of a long line', () => {
    const source = 'a'.repeat(3 * CHUNK_LENGTH) + 'needle'
    expect(search(source, 'needle')).toEqual([{ from: 3 * CHUNK_LENGTH, to: 3 * CHUNK_LENGTH + 6 }])
  })

  it('finds each match once where two chunks overlap', () => {
    const source = 'a'.repeat(CHUNK_LENGTH - 1) + 'needle needle' + 'a'.repeat(CHUNK_LENGTH)
    expect(search(source, 'needle')).toEqual([
      { from: CHUNK_LENGTH - 1, to: CHUNK_LENGTH + 5 },
      { from: CHUNK_LENGTH + 6, to: CHUNK_LENGTH + 12 }
    ])
  })

  it('does not overlap two matches found in two chunks', () => {
    const source = 'b'.repeat(CHUNK_LENGTH - 1) + 'aaa' + 'b'.repeat(CHUNK_LENGTH)
    expect(search(source, 'aa')).toEqual([{ from: CHUNK_LENGTH - 1, to: CHUNK_LENGTH + 1 }])
  })

  it('keeps finding a repeated term past a chunk boundary like a single scan', () => {
    const source = 'b' + 'a'.repeat(2 * CHUNK_LENGTH)
    const matches = search(source, 'aa')
    expect(matches).toHaveLength(CHUNK_LENGTH)
    expect(matches.at(-1)).toEqual({ from: 2 * CHUNK_LENGTH - 1, to: 2 * CHUNK_LENGTH + 1 })
  })

  it('finds a term longer than the chunk overlap across a chunk boundary', () => {
    const term = 'ab'.repeat(600)
    const source = 'x'.repeat(CHUNK_LENGTH - 50) + term + 'x'.repeat(100)
    expect(search(source, term)).toEqual([{ from: CHUNK_LENGTH - 50, to: CHUNK_LENGTH - 50 + term.length }])
  })

  it('finds a decomposed term across a chunk boundary', () => {
    const decomposed = 'é'.repeat(600)
    const source = 'x'.repeat(CHUNK_LENGTH - 100) + decomposed + 'y'
    expect(search(source, 'e'.repeat(600))).toEqual([{ from: CHUNK_LENGTH - 100, to: CHUNK_LENGTH - 100 + decomposed.length }])
  })

  it('folds a long line one bounded chunk at a time', () => {
    const source = 'needle '.repeat(10 * CHUNK_LENGTH / 7)
    search(source, 'needle')
    const foldedLengths = findFoldedMatches.mock.calls.map(([text]) => text.length)
    expect(Math.max(...foldedLengths)).toBeLessThan(2 * CHUNK_LENGTH)
  })

  it('only folds with offsets the chunks that can hold the term', () => {
    const source = ['nothing here', 'a needle', 'nothing either'].join('\n')
    search(source, 'needle')
    expect(findFoldedMatches).toHaveBeenCalledTimes(1)
  })
})
