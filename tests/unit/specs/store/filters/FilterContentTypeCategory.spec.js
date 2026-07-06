import bodybuilder from 'bodybuilder'
import { setActivePinia, createPinia } from 'pinia'

import IPhFiles from '~icons/ph/files'
import filtersDefs from '@/store/filters'
import FilterContentTypeCategory from '@/store/filters/FilterContentTypeCategory'
import DisplayContentTypeCategory from '@/components/Display/DisplayContentTypeCategory'
import { apiInstance as api } from '@/api/apiInstance'
import { useSearchStore } from '@/store/modules'
import { findBoolShould, findTermsClause } from '~tests/unit/specs/utils/esQueryBody'

describe('FilterContentTypeCategory.js', () => {
  describe('breadcrumb icon', () => {
    it('uses the files icon so the breadcrumb chip reads as file types', () => {
      const def = filtersDefs.find(d => d.options.name === 'contentTypeCategory')
      expect(def.options.icon).toBe(IPhFiles)
    })
  })

  describe('hidden flag', () => {
    it('defaults to false when not provided', () => {
      const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })
      expect(filter.hidden).toBe(false)
    })

    it('is stored when provided', () => {
      const filter = new FilterContentTypeCategory({
        name: 'contentTypeCategory',
        key: 'contentTypeCategory',
        hidden: true
      })
      expect(filter.hidden).toBe(true)
    })
  })

  describe('itemLabel', () => {
    const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })

    it('returns the i18n translation key for the category so labelToHuman can resolve it', () => {
      expect(filter.itemLabel({ key: 'AUDIO' })).toBe('filter.contentTypeCategoryItem.AUDIO')
    })

    it('returns an i18n key even for unknown categories so the caller can still render a sensible fallback', () => {
      expect(filter.itemLabel({ key: 'UNKNOWN' })).toBe('filter.contentTypeCategoryItem.UNKNOWN')
    })
  })

  describe('keyAliases', () => {
    const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })

    it('matches a category key from a lowercased fragment', () => {
      const aliases = filter.keyAliases('audi')
      expect(aliases).toContain('AUDIO')
    })

    it('returns no matches when the query matches nothing', () => {
      const aliases = filter.keyAliases('zzz')
      expect(aliases).toHaveLength(0)
    })
  })

  describe('static display', () => {
    it('exposes DisplayContentTypeCategory for breadcrumb rendering', () => {
      expect(FilterContentTypeCategory.display).toBe(DisplayContentTypeCategory)
    })
  })

  describe('graceful behavior when category buckets are absent', () => {
    // Legacy indices may be re-indexed without the contentTypeCategory field;
    // the filter must keep working — silently producing no options — instead
    // of throwing or warning, so the rest of the UI can stay live.
    let filter, errorSpy, warnSpy

    beforeEach(() => {
      filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      errorSpy.mockRestore()
      warnSpy.mockRestore()
    })

    it('does not throw when keyAliases is queried for an unknown fragment', () => {
      expect(() => filter.keyAliases('zzz')).not.toThrow()
      expect(filter.keyAliases('zzz')).toEqual([])
      expect(errorSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('builds an aggregation body without throwing even though no buckets will come back', () => {
      expect(() => filter.body(bodybuilder(), {}, 0, 8)).not.toThrow()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('itemLabel falls back gracefully on a bucketless category', () => {
      expect(() => filter.itemLabel({})).not.toThrow()
      expect(filter.itemLabel({})).toBe('filter.contentTypeCategoryItem.undefined')
      expect(errorSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })

  describe('include/exclude query fields', () => {
    // Category values are stored uppercase (IMAGE). A `terms` query on the
    // analysed `text` field never matches uppercase, so we query the raw value:
    // `.keyword` on text+keyword indices, the bare field on pure-keyword indices.
    // Both are OR-combined so one query stays correct across both mappings.
    const filter = new FilterContentTypeCategory({ name: 'contentTypeCategory', key: 'contentTypeCategory' })
    const param = { name: 'contentTypeCategory', values: ['IMAGE'] }

    it('includes documents matching the raw value on either the keyword sub-field or the bare field', () => {
      const body = filter.addChildIncludeFilter(bodybuilder(), param).build()
      const should = body.query.bool.filter.bool.should
      expect(should).toContainEqual({ terms: { 'contentTypeCategory.keyword': ['IMAGE'] } })
      expect(should).toContainEqual({ terms: { contentTypeCategory: ['IMAGE'] } })
    })

    it('excludes documents matching the raw value on either field, in the cached filter context', () => {
      const body = filter.addChildExcludeFilter(bodybuilder(), param).build()
      // must_not lives inside the filter context (like every other exclude),
      // wrapping a both-fields should.
      const should = body.query.bool.filter.bool.must_not[0].bool.should
      expect(should).toContainEqual({ terms: { 'contentTypeCategory.keyword': ['IMAGE'] } })
      expect(should).toContainEqual({ terms: { contentTypeCategory: ['IMAGE'] } })
    })

    it('wraps the parent include clause in has_parent, querying both fields', () => {
      const body = filter.addParentIncludeFilter(bodybuilder(), param).build()
      const hasParent = body.query.has_parent
      expect(hasParent.parent_type).toBe('Document')
      const should = hasParent.query.bool.should
      expect(should).toContainEqual({ terms: { 'contentTypeCategory.keyword': ['IMAGE'] } })
      expect(should).toContainEqual({ terms: { contentTypeCategory: ['IMAGE'] } })
    })

    it('wraps the parent exclude clause in has_parent with a negated both-fields bool', () => {
      const body = filter.addParentExcludeFilter(bodybuilder(), param).build()
      const should = body.query.has_parent.query.bool.must_not[0].bool.should
      expect(should).toContainEqual({ terms: { 'contentTypeCategory.keyword': ['IMAGE'] } })
      expect(should).toContainEqual({ terms: { contentTypeCategory: ['IMAGE'] } })
    })
  })

  describe('aggregation body invariant for the contentTypeCategory bucket request', () => {
    let searchStore

    beforeEach(() => {
      setActivePinia(createPinia())
      searchStore = useSearchStore()
      searchStore.setIndex('test-index')
    })

    function buildAggBody(filterName) {
      // Mirrors the body construction performed by `searchFilter`: build the
      // bucket's own aggregation, then apply the other filters and the query.
      const filter = searchStore.getFilter({ name: filterName })
      const otherFilters = searchStore.instantiatedFilters.filter(other => other.name !== filter.name)
      const body = filter.body(bodybuilder(), {}, 0, 8)
      api.elasticsearch._applyFilters(body, otherFilters)
      api.elasticsearch._applyQueryString(body, '*', [])
      return body.size(0).rawOption('track_total_hits', true).build()
    }

    it('does not OR-combine the paired contentType when both have values', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentTypeCategory')

      // The agg body must not carry the US-001 OR-combine sub-query.
      expect(findBoolShould(body.query)).toBeNull()
    })

    it('omits the bucket\'s own contentTypeCategory selection from the agg filter context', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentTypeCategory')

      // contentTypeCategory is the bucket field — its current selection must not
      // restrict its own buckets, otherwise the user only ever sees the values
      // they already picked.
      expect(findTermsClause(body.query, 'contentTypeCategory')).toBeNull()
    })

    it('keeps the paired contentType selection as a regular AND filter on the agg', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentTypeCategory')

      expect(findTermsClause(body.query, 'contentType')).toEqual(['application/pdf'])
    })

    it('produces an unconstrained agg body when only the bucket\'s own filter has values', () => {
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentTypeCategory')

      // No bucket-side terms (excluded) and no paired terms (no values), no OR-combine.
      expect(findBoolShould(body.query)).toBeNull()
      expect(findTermsClause(body.query, 'contentTypeCategory')).toBeNull()
      expect(findTermsClause(body.query, 'contentType')).toBeNull()
    })
  })
})
