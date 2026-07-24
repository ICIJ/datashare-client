import FilterText from '@/store/filters/FilterText'

describe('FilterText.js', () => {
  describe('pagelessBucketSize', () => {
    it('defaults to null when not provided', () => {
      const filter = new FilterText({ name: 'foo', key: 'foo' })
      expect(filter.pagelessBucketSize).toBeNull()
    })

    it('stores the provided numeric value', () => {
      const filter = new FilterText({ name: 'foo', key: 'foo', pagelessBucketSize: 500 })
      expect(filter.pagelessBucketSize).toBe(500)
    })
  })
})
