import FilterContentTypeCategory from '@/store/filters/FilterContentTypeCategory'
import DisplayContentTypeCategory from '@/components/Display/DisplayContentTypeCategory'

describe('FilterContentTypeCategory.js', () => {
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
      expect(filter.itemLabel({ key: 'AUDIO' })).toBe('filter.contentTypeCategory.AUDIO')
    })

    it('returns an i18n key even for unknown categories so the caller can still render a sensible fallback', () => {
      expect(filter.itemLabel({ key: 'UNKNOWN' })).toBe('filter.contentTypeCategory.UNKNOWN')
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
})
