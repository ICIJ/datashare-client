import filters from '@/store/filters'

describe('filters index', () => {
  const getOptions = name => filters.find(f => f.options.name === name)?.options

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
})
