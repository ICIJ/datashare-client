import filters from '@/store/filters'

describe('filters index', () => {
  const getDefinition = name => filters.find(f => f.options.name === name)
  const getOptions = name => getDefinition(name)?.options

  describe('pageless opt-ins', () => {
    it('configures language with pagelessBucketSize 1000', () => {
      expect(getOptions('language')?.pagelessBucketSize).toBe(1000)
    })

    it('configures contentType with pagelessBucketSize 1000', () => {
      expect(getOptions('contentType')?.pagelessBucketSize).toBe(1000)
    })

    it('configures extractionLevel with pagelessBucketSize 10', () => {
      expect(getOptions('extractionLevel')?.pagelessBucketSize).toBe(10)
    })
  })

  describe('other filters stay paginated', () => {
    it.each(['tags', 'path', 'namedEntityPerson', 'namedEntityOrganization', 'namedEntityLocation', 'namedEntityEmail'])(
      '%s has no pagelessBucketSize',
      (name) => {
        expect(getOptions(name)?.pagelessBucketSize).toBeUndefined()
      }
    )
  })

  describe('hidden contentTypeCategory filter', () => {
    it('is registered with type FilterContentTypeCategory', () => {
      expect(getDefinition('contentTypeCategory')?.type).toBe('FilterContentTypeCategory')
    })

    it('uses contentTypeCategory as key', () => {
      expect(getOptions('contentTypeCategory')?.key).toBe('contentTypeCategory')
    })

    it('is flagged as hidden so it does not render in the filters panel', () => {
      expect(getOptions('contentTypeCategory')?.hidden).toBe(true)
    })

    it('belongs to the documentsInfo section', () => {
      expect(getOptions('contentTypeCategory')?.section).toBe('documentsInfo')
    })
  })
})
