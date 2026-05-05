import { describe, it, expect } from 'vitest'

import { useAdvancedSearchForm, getInitialForm, toQueryShape, ADVANCED_SEARCH_FIELDS } from '@/composables/useAdvancedSearchForm'

describe('useAdvancedSearchForm', () => {
  describe('getInitialForm', () => {
    it('starts with empty word inputs and "All fields" selected', () => {
      const f = getInitialForm()
      expect(f.anyWords).toBe('')
      expect(f.allWords).toBe('')
      expect(f.exactPhrase).toBe('')
      expect(f.noneWords).toBe('')
      expect(f.fuzzyTerm).toBe('')
      expect(f.proximityPhrase).toBe('')
      expect(f.fieldAll).toBe(true)
      expect(f.selectedFields).toEqual([])
    })

    it('defaults distance sliders to 1 (the disabled-state floor)', () => {
      const f = getInitialForm()
      expect(f.fuzzyDistance).toBe(1)
      expect(f.proximityDistance).toBe(1)
    })
  })

  describe('toQueryShape', () => {
    it('splits word lists on whitespace', () => {
      const out = toQueryShape({
        ...getInitialForm(),
        anyWords: 'foo  bar',
        allWords: 'a b c',
        noneWords: 'x'
      })
      expect(out.anyWords).toEqual(['foo', 'bar'])
      expect(out.allWords).toEqual(['a', 'b', 'c'])
      expect(out.noneWords).toEqual(['x'])
    })

    it('keeps the exact phrase as a single trimmed entry', () => {
      const out = toQueryShape({ ...getInitialForm(), exactPhrase: '  Société SAS  ' })
      expect(out.exactPhrase).toEqual(['Société SAS'])
    })

    it('produces an empty exactPhrase array when blank', () => {
      const out = toQueryShape({ ...getInitialForm(), exactPhrase: '   ' })
      expect(out.exactPhrase).toEqual([])
    })
  })

  describe('isFormEmpty', () => {
    it('starts true and flips to false on any word input', () => {
      const { form, isFormEmpty } = useAdvancedSearchForm()
      expect(isFormEmpty.value).toBe(true)
      form.anyWords = 'foo'
      expect(isFormEmpty.value).toBe(false)
    })

    it('treats whitespace-only inputs as empty', () => {
      const { form, isFormEmpty } = useAdvancedSearchForm()
      form.anyWords = '   '
      form.exactPhrase = '\t\n'
      expect(isFormEmpty.value).toBe(true)
    })

    it('does not consider distance values when deciding emptiness', () => {
      const { form, isFormEmpty } = useAdvancedSearchForm()
      form.fuzzyDistance = 2
      form.proximityDistance = 4
      expect(isFormEmpty.value).toBe(true)
    })
  })

  describe('field mutual exclusion', () => {
    it('clears individual fields when "All" is checked', () => {
      const { form, setFieldAll } = useAdvancedSearchForm()
      form.fieldAll = false
      form.selectedFields = ['tags', 'content']
      setFieldAll(true)
      expect(form.fieldAll).toBe(true)
      expect(form.selectedFields).toEqual([])
    })

    it('ignores attempts to untick "All" directly', () => {
      const { form, setFieldAll } = useAdvancedSearchForm()
      setFieldAll(false)
      expect(form.fieldAll).toBe(true)
    })

    it('toggles "All" off when at least one individual field is selected', () => {
      const { form, setSelectedFields } = useAdvancedSearchForm()
      setSelectedFields(['tags'])
      expect(form.fieldAll).toBe(false)
      expect(form.selectedFields).toEqual(['tags'])
    })

    it('re-selects "All" when the last individual field is unticked', () => {
      const { form, setSelectedFields } = useAdvancedSearchForm()
      form.fieldAll = false
      setSelectedFields([])
      expect(form.fieldAll).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears every entry and restores defaults', () => {
      const { form, reset } = useAdvancedSearchForm()
      form.anyWords = 'foo'
      form.fuzzyDistance = 2
      form.fieldAll = false
      form.selectedFields = ['tags']
      reset()
      expect(form.anyWords).toBe('')
      expect(form.fuzzyDistance).toBe(1)
      expect(form.fieldAll).toBe(true)
      expect(form.selectedFields).toEqual([])
    })
  })

  describe('ADVANCED_SEARCH_FIELDS', () => {
    it('exposes only real Elasticsearch field paths', () => {
      // Catch a regression where alias-style values like `contentAuthor`
      // (which match no document) sneak back in.
      const known = new Set([
        'tags', 'path', 'content', 'dirname',
        'metadata.tika_metadata_dc_creator',
        'metadata.tika_metadata_message_to',
        'metadata.tika_metadata_message_raw_header_thread_index'
      ])
      for (const field of ADVANCED_SEARCH_FIELDS) {
        expect(known.has(field.value)).toBe(true)
      }
    })
  })
})
