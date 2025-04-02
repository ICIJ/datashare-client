import bodybuilder from 'bodybuilder'

import FilterEntity from '@/store/filters/FilterEntity'

describe('FilterEntity.js', () => {
  it('should filter on existing category', () => {
    const filter = new FilterEntity({})
    const q = filter.queryBuilder(
      bodybuilder(),
      { name: 'namedEntityLocation', reverse: false, values: ['luxembourg'] },
      'query'
    )
    expect(JSON.stringify(q.build())).toContain('{"query_string":{"default_field":"category","query":"LOCATION"}}')
  })

  it('should filter on non existing category', () => {
    const filter = new FilterEntity({})
    const q = filter.queryBuilder(bodybuilder(), { name: 'GPE', reverse: false, values: ['luxembourg'] }, 'query')
    expect(JSON.stringify(q.build())).toContain('{"query_string":{"default_field":"category","query":"GPE"}}')
  })
})
