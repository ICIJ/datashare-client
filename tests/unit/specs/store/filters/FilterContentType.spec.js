import bodybuilder from 'bodybuilder'
import { setActivePinia, createPinia } from 'pinia'

import FilterContentType from '@/store/filters/FilterContentType'
import DisplayContentType from '@/components/Display/DisplayContentType'
import { apiInstance as api } from '@/api/apiInstance'
import { useSearchStore } from '@/store/modules'

describe('FilterContentType.js', () => {
  describe('itemLabel', () => {
    const filter = new FilterContentType({ name: 'contentType', key: 'contentType' })

    it('returns the human-readable label for a known MIME type', () => {
      expect(filter.itemLabel({ key: 'application/pdf' })).toBe('Portable Document Format (PDF)')
    })

    it('falls back to the raw MIME key when the type is unknown', () => {
      expect(filter.itemLabel({ key: 'application/x-unknown' })).toBe('application/x-unknown')
    })
  })

  describe('keyAliases', () => {
    const filter = new FilterContentType({ name: 'contentType', key: 'contentType' })

    it('matches a MIME key from a label-based search query', () => {
      const aliases = filter.keyAliases('pdf')
      expect(aliases).toContain('application/pdf')
    })

    it('returns an empty array when the query matches no label', () => {
      const aliases = filter.keyAliases('this-label-does-not-exist')
      expect(aliases).toHaveLength(0)
    })
  })

  describe('static display', () => {
    it('exposes DisplayContentType for breadcrumb rendering', () => {
      expect(FilterContentType.display).toBe(DisplayContentType)
    })
  })

  describe('aggregation body invariant for the contentType bucket request', () => {
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

    function findBoolShould(node) {
      if (!node || typeof node !== 'object') {
        return null
      }
      if (Array.isArray(node)) {
        for (const child of node) {
          const found = findBoolShould(child)
          if (found) return found
        }
        return null
      }
      if (node.bool && Array.isArray(node.bool.should) && node.bool.should.length > 1) {
        return node.bool
      }
      for (const value of Object.values(node)) {
        const found = findBoolShould(value)
        if (found) return found
      }
      return null
    }

    function findTermsClause(node, field) {
      if (!node || typeof node !== 'object') {
        return null
      }
      if (Array.isArray(node)) {
        for (const child of node) {
          const found = findTermsClause(child, field)
          if (found) return found
        }
        return null
      }
      if (node.terms && Object.prototype.hasOwnProperty.call(node.terms, field)) {
        return node.terms[field]
      }
      for (const value of Object.values(node)) {
        const found = findTermsClause(value, field)
        if (found) return found
      }
      return null
    }

    it('does not OR-combine the paired contentTypeCategory when both have values', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentType')

      // The agg body must not carry the US-001 OR-combine sub-query.
      expect(findBoolShould(body.query)).toBeNull()
    })

    it('omits the bucket\'s own contentType selection from the agg filter context', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentType')

      // contentType is the bucket field — its current selection must not
      // restrict its own buckets, otherwise the user only ever sees the values
      // they already picked.
      expect(findTermsClause(body.query, 'contentType')).toBeNull()
    })

    it('keeps the paired contentTypeCategory selection as a regular AND filter on the agg', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentTypeCategory', value: 'DOCUMENT' })

      const body = buildAggBody('contentType')

      expect(findTermsClause(body.query, 'contentTypeCategory')).toEqual(['DOCUMENT'])
    })

    it('produces an unconstrained agg body when only the bucket\'s own filter has values', () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })

      const body = buildAggBody('contentType')

      // No bucket-side terms (excluded) and no paired terms (no values), no OR-combine.
      expect(findBoolShould(body.query)).toBeNull()
      expect(findTermsClause(body.query, 'contentType')).toBeNull()
      expect(findTermsClause(body.query, 'contentTypeCategory')).toBeNull()
    })
  })
})
