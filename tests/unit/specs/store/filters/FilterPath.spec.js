import FilterPath from '@/store/filters/FilterPath'
import bodybuilder from 'bodybuilder'

describe('FilterPath.js', () => {
  it('should add slash to path in json if path doesnt have one', () => {
    const filter = new FilterPath({})
    const q = filter.queryBuilder(bodybuilder(), { name: 'path', values: ['/home/foo/bar'] }, 'query')
    expect(JSON.stringify(q.build())).toContain(
      '{"query":{"bool":{"query":{"term":{"dirname.tree":"/home/foo/bar"}}}}}'
    )
  })

  it('should NOT add slash to path in json if path already have one', () => {
    const filter = new FilterPath({})
    const q = filter.queryBuilder(bodybuilder(), { name: 'path', values: ['/home/foo/bar/'] }, 'query')
    expect(JSON.stringify(q.build())).toContain(
      '{"query":{"bool":{"query":{"term":{"dirname.tree":"/home/foo/bar"}}}}}'
    )
  })
})
