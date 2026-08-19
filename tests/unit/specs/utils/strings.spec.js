import { addLocalSearchMarksClass, addLocalSearchMarksClassByOffsets, isUrl, getConsonants, foldWithSourceIndexes, addSearchMarksClassInHtml } from '@/utils/strings'

describe('strings', () => {
  describe('addLocalSearchMarksClass', () => {
    it('should wrap "dolor" (lowercase) with tags in string without HTML', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum dolor', { label: 'dolor' })
      expect(content).toBe('Lorem ipsum <mark class="local-search-term">dolor</mark>')
    })

    it('shouldn\'t wrap anything', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum dolor', { label: 'sit amet' })
      expect(content).toBe('Lorem ipsum dolor')
    })

    it('should wrap "DOLOR" (uppercase) with tags in string without HTML', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum DOLOR', { label: 'dolor' })
      expect(content).toBe('Lorem ipsum <mark class="local-search-term">DOLOR</mark>')
    })

    it('should wrap "DOLOR" with tags in uppercase string without HTML', () => {
      const { content } = addLocalSearchMarksClass('LOREM IPSUM DOLOR', { label: 'dolor' })
      expect(content).toBe('LOREM IPSUM <mark class="local-search-term">DOLOR</mark>')
    })

    it('should wrap "dolor" with tags string without HTML even with a toekn in uppercase', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum dolor', { label: 'DOLOR' })
      expect(content).toBe('Lorem ipsum <mark class="local-search-term">dolor</mark>')
    })

    it('should wrap "Lorem ipsum" with tags string without HTML even with a toekn in camelcase', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum dolor', { label: 'Lorem Ipsum' })
      expect(content).toBe('<mark class="local-search-term">Lorem ipsum</mark> dolor')
    })

    it('should wrap "Lorem" with tags in string without HTML', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum dolor', { label: 'Lorem' })
      expect(content).toBe('<mark class="local-search-term">Lorem</mark> ipsum dolor')
    })

    it('should wrap "dolor" with tags in string with HTML', () => {
      const { content } = addLocalSearchMarksClass('Lorem <strong>ipsum</strong> dolor', { label: 'dolor' })
      expect(content).toBe('Lorem <strong>ipsum</strong> <mark class="local-search-term">dolor</mark>')
    })

    it('should wrap "ipsum" with tags in string with HTML', () => {
      const { content } = addLocalSearchMarksClass('Lorem <strong>ipsum</strong> dolor', { label: 'ipsum' })
      expect(content).toBe('Lorem <strong><mark class="local-search-term">ipsum</mark></strong> dolor')
    })

    it('should wrap "ipsum" with tags in string with HTML, wrapped with a span', () => {
      const { content } = addLocalSearchMarksClass('<span>Lorem <strong>ipsum</strong> dolor</span>', {
        label: 'ipsum'
      })
      expect(content).toBe('<span>Lorem <strong><mark class="local-search-term">ipsum</mark></strong> dolor</span>')
    })

    it('should wrap "dolor" in a deeply nested string', () => {
      const { content } = addLocalSearchMarksClass('<i>Lorem</i> <strong>ipsum <span>dolor</span></strong>', {
        label: 'dolor'
      })
      expect(content).toBe(
        '<i>Lorem</i> <strong>ipsum <span><mark class="local-search-term">dolor</mark></span></strong>'
      )
    })

    it('should wrap "Lorem" in a deeply nested string', () => {
      const { content } = addLocalSearchMarksClass('<i>Lorem</i> <strong>ipsum <span>dolor</span></strong>', {
        label: 'lorem'
      })
      expect(content).toBe(
        '<i><mark class="local-search-term">Lorem</mark></i> <strong>ipsum <span>dolor</span></strong>'
      )
    })

    it('shouldn\'t wrap "Lorem ipsum" in different tags', () => {
      const { content } = addLocalSearchMarksClass('<i>Lorem</i> <strong>ipsum <span>dolor</span></strong>', {
        label: 'Lorem ipsum'
      })
      expect(content).toBe('<i>Lorem</i> <strong>ipsum <span>dolor</span></strong>')
    })

    it('should wrap regex', () => {
      const { content } = addLocalSearchMarksClass(
        'France is not a tax heaven.\nBut most probably a taxidermists country.',
        { label: 'tax.*', regex: true }
      )
      expect(content).toBe(
        'France is not a <mark class="local-search-term">tax heaven. But most probably a taxidermists country.</mark>'
      )
    })

    it('should display HTML characters', () => {
      const { content } = addLocalSearchMarksClass('Lorem ipsum <dolor & other > or', { label: 'ipsum' })
      expect(content).toBe('Lorem <mark class="local-search-term">ipsum</mark> <dolor & other > or')
    })

    it('should preserve HTML tags', () => {
      const { content } = addLocalSearchMarksClass('Lorem <div>ipsum</div> <span>dolor</span>', { label: 'ipsum' })
      expect(content).toBe('Lorem <div><mark class="local-search-term">ipsum</mark></div> <span>dolor</span>')
    })

    it('should ignore carriage return', () => {
      const { content, localSearchOccurrences } = addLocalSearchMarksClass('content content Donald \nTrump content', {
        label: 'Donald Trump'
      })

      expect(localSearchOccurrences).toBe(1)
      expect(content).toBe('content content <mark class="local-search-term">Donald Trump</mark> content')
    })
  })

  describe('addLocalSearchMarksClassByOffsets', () => {
    it('should replace "ipsum" using its offset', () => {
      const content = 'lorem ipsum'
      const term = 'ipsum'
      const offsets = [6]
      const marked = addLocalSearchMarksClassByOffsets({ content, offsets, term })
      expect(marked).toBe('lorem <mark class="local-search-term" data-offset="6">ipsum</mark>')
    })

    it('should replace "lorem" using its offset', () => {
      const content = 'lorem ipsum'
      const term = 'lorem'
      const offsets = [0]
      const marked = addLocalSearchMarksClassByOffsets({ content, offsets, term })
      expect(marked).toBe('<mark class="local-search-term" data-offset="0">lorem</mark> ipsum')
    })

    it('should replace "i" using theirs offsets', () => {
      const content = 'ICIJ'
      const term = 'i'
      const offsets = [0, 2]
      const marked = addLocalSearchMarksClassByOffsets({ content, offsets, term })
      expect(marked).toBe(
        '<mark class="local-search-term" data-offset="0">I</mark>C<mark class="local-search-term" data-offset="2">I</mark>J'
      )
    })

    it('should replace "dolor" using its offset minus the given delta', () => {
      const content = 'lorem ipsum dolor sit amet'
      const term = 'dolor'
      const offsets = [100]
      const delta = 88
      const marked = addLocalSearchMarksClassByOffsets({ content, offsets, term, delta })
      expect(marked).toBe('lorem ipsum <mark class="local-search-term" data-offset="100">dolor</mark> sit amet')
    })
  })

  describe('isUrl', () => {
    it('should return false if it is NOT an url', () => {
      const url = 'no_url'
      expect(isUrl(url)).toBeFalsy()
    })

    it('should return true if it is an url', () => {
      const url = 'http://www.google.fr'
      expect(isUrl(url)).toBeTruthy()
    })

    it('should return false if it is an sftp url', () => {
      const url = 'sftp://www.google.fr'
      expect(isUrl(url)).toBeFalsy()
    })

    it('should return true if it is an sftp url as requested', () => {
      const url = 'sftp://www.google.fr'
      expect(isUrl(url, ['sftp'])).toBeTruthy()
    })
  })

  describe('getConsonants', () => {
    it('get 3 consonants from `local` string', () => {
      expect(getConsonants('local').join('')).toBe('lcl')
    })

    it('get 3 consonants from `LOCAL` string while keeping the case', () => {
      expect(getConsonants('LOCAL').join('')).toBe('LCL')
    })

    it('get 0 consonants from `oui` string', () => {
      expect(getConsonants('oui')).toHaveLength(0)
    })
  })

  describe('foldWithSourceIndexes', () => {
    it('lowercases and strips diacritics', () => {
      expect(foldWithSourceIndexes('Société').folded).toBe('societe')
    })

    it('maps every folded char back to its source index', () => {
      const { folded, sourceIndexes } = foldWithSourceIndexes('Où')
      expect(folded).toBe('ou')
      expect(sourceIndexes).toEqual([0, 1])
    })

    it('keeps the map aligned when the fold expands a ligature', () => {
      const { folded, sourceIndexes } = foldWithSourceIndexes('aﬀb')
      expect(folded).toBe('affb')
      expect(sourceIndexes).toEqual([0, 1, 1, 2])
    })

    it('folds characters outside the basic multilingual plane', () => {
      // Iterating by code unit would hand NFKD a lone surrogate, which folds to
      // nothing, and the backend folds the whole string.
      expect(foldWithSourceIndexes('\u{1D400}\u{1D401}\u{1D402}').folded).toBe('abc')
    })

    it('maps an astral char back to the index of its first code unit', () => {
      const { folded, sourceIndexes } = foldWithSourceIndexes('a\u{1D400}b')
      expect(folded).toBe('aab')
      expect(sourceIndexes).toEqual([0, 1, 3])
    })

    it('ends a source range past a stripped combining mark', () => {
      const { sourceEnds } = foldWithSourceIndexes('e\u0301')
      expect(sourceEnds).toEqual([2])
    })
  })

  describe('addSearchMarksClassInHtml', () => {
    it('wraps a case-insensitive match in a mark tag', () => {
      const html = '<p>Hello World</p>'
      const marked = addSearchMarksClassInHtml(html, 'world')
      expect(marked).toBe('<p>Hello <mark class="local-search-term">World</mark></p>')
    })

    it('marks a decomposed diacritic without orphaning the accent', () => {
      const html = '<p>La socie\u0301te\u0301 e\u0301cran</p>'
      const marked = addSearchMarksClassInHtml(html, 'societe')
      expect(marked).toBe('<p>La <mark class="local-search-term">socie\u0301te\u0301</mark> e\u0301cran</p>')
    })

    it('marks a term made of astral characters', () => {
      const marked = addSearchMarksClassInHtml('<p>\u{1D400}\u{1D401}\u{1D402}</p>', 'abc')
      expect(marked).toBe('<p><mark class="local-search-term">\u{1D400}\u{1D401}\u{1D402}</mark></p>')
    })

    it('marks a diacritic variant of the term', () => {
      const html = '<p>La société écran</p>'
      const marked = addSearchMarksClassInHtml(html, 'societe')
      expect(marked).toContain('<mark class="local-search-term">société</mark>')
    })

    it('marks every occurrence across elements', () => {
      const html = '<h1>data</h1><p>data and data</p>'
      const marked = addSearchMarksClassInHtml(html, 'data')
      expect(marked.match(/<mark class="local-search-term">/g)).toHaveLength(3)
    })

    it('never matches across element boundaries or inside attributes', () => {
      const html = '<p><a href="https://data.example.org" title="data">a link</a></p>'
      const marked = addSearchMarksClassInHtml(html, 'data')
      expect(marked).toBe(html)
    })

    it('returns the html untouched for a blank term', () => {
      const html = '<p>Hello</p>'
      expect(addSearchMarksClassInHtml(html, '  ')).toBe(html)
      expect(addSearchMarksClassInHtml(html, '')).toBe(html)
    })

    it('returns the html untouched when the search term folds to nothing', () => {
      expect(addSearchMarksClassInHtml('<p>Hello</p>', '́')).toBe('<p>Hello</p>')
    })

    it('does not nest marks when a ligature folds to a repeated term', () => {
      // 'ﬀ' folds to 'ff', so the term 'f' matches twice inside it, both
      // mapping back to the same source range: that must produce one mark,
      // not one nested inside the other.
      const marked = addSearchMarksClassInHtml('<p>aﬀb</p>', 'f')
      expect(marked.match(/<mark class="local-search-term">/g)).toHaveLength(1)
      expect(marked).not.toContain('<mark class="local-search-term"><mark')
    })

    it('does not throw on overlapping (non-identical) folded ranges from a ligature', () => {
      // 'ﬀ' folds to 'ff', so the term 'ff' matches at offsets 0 and 1 inside
      // the single source character, producing overlapping (not identical)
      // ranges [{0,2},{1,3}] that must not both be wrapped.
      expect(() => addSearchMarksClassInHtml('<p>fﬀf</p>', 'ff')).not.toThrow()
      const marked = addSearchMarksClassInHtml('<p>fﬀf</p>', 'ff')
      expect(marked.match(/<mark class="local-search-term">/g)).toHaveLength(1)
    })

    it('does not throw on overlapping (non-identical) folded ranges from a roman numeral', () => {
      // 'Ⅲ' folds to 'iii', so the term 'ii' matches at offsets 0 and 1 inside
      // the single source character, producing overlapping ranges [{0,1},{0,2}].
      expect(() => addSearchMarksClassInHtml('<p>Ⅲi</p>', 'ii')).not.toThrow()
      const marked = addSearchMarksClassInHtml('<p>Ⅲi</p>', 'ii')
      expect(marked.match(/<mark class="local-search-term">/g)).toHaveLength(1)
    })
  })
})
