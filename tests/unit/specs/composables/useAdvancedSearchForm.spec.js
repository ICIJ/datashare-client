import { describe, it, expect } from 'vitest'

import { useAdvancedSearchForm, getInitialForm, toQueryShape, ADVANCED_SEARCH_FIELDS } from '@/composables/useAdvancedSearchForm'
import settings from '@/utils/settings'

describe('useAdvancedSearchForm', () => {
  describe('getInitialForm', () => {
    it('starts with empty word inputs and the "all" field selected', () => {
      const f = getInitialForm()
      expect(f.anyWords).toBe('')
      expect(f.allWords).toBe('')
      expect(f.exactPhrase).toBe('')
      expect(f.noneWords).toBe('')
      expect(f.fuzzyTerm).toBe('')
      expect(f.proximityPhrase).toBe('')
      expect(f.field).toBe('all')
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

  describe('setField', () => {
    it('selects a single field', () => {
      const { form, setField } = useAdvancedSearchForm()
      setField('tags')
      expect(form.field).toBe('tags')
    })

    it('switches back to "all"', () => {
      const { form, setField } = useAdvancedSearchForm()
      setField('content')
      setField('all')
      expect(form.field).toBe('all')
    })
  })

  describe('reset', () => {
    it('clears every entry and restores defaults', () => {
      const { form, reset } = useAdvancedSearchForm()
      form.anyWords = 'foo'
      form.fuzzyDistance = 2
      form.field = 'tags'
      reset()
      expect(form.anyWords).toBe('')
      expect(form.fuzzyDistance).toBe(1)
      expect(form.field).toBe('all')
    })
  })

  describe('ADVANCED_SEARCH_FIELDS', () => {
    it('mirrors the search bar field keys so the value is a valid store field', () => {
      const known = new Set(settings.searchFields.map(({ key }) => key))
      expect(ADVANCED_SEARCH_FIELDS.length).toBe(settings.searchFields.length)
      for (const field of ADVANCED_SEARCH_FIELDS) {
        expect(known.has(field.value)).toBe(true)
        expect(field.label).toBe(`search.field.${field.value}`)
      }
    })
  })
})
