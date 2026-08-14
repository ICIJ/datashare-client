import { elasticsearch } from '@/api/elasticsearch'
import { FilterText } from '@/store/filters'

describe('elasticsearch searchFilter', () => {
  const index = 'local-datashare'

  function bindFilter(filter, values, { excluded = false } = {}) {
    const excludeFilters = excluded ? [filter.name] : []
    filter.bindStore({ values, excludeFilters, contextualizeFilters: [filter.name], sortFilters: {} })
    return filter
  }

  function findTermsClause(query, field) {
    if (query?.terms?.[field]) {
      return query.terms[field]
    }

    const children = [query?.bool?.filter, query?.bool?.must, query?.bool?.should, query?.bool?.must_not]

    for (const child of children.flat().filter(Boolean)) {
      const found = findTermsClause(child, field)
      if (found) {
        return found
      }
    }

    return null
  }

  async function contextualizedBody(filter, filters) {
    const spy = vi.spyOn(elasticsearch, '_search').mockResolvedValue({})
    await elasticsearch.searchFilter(index, filter, '', filters, true)
    return spy.mock.calls[0][0].body
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('applies an unpaired filter own selection to its aggregation context', async () => {
    const values = { tags: ['bar'] }
    const tags = bindFilter(new FilterText({ name: 'tags', key: 'tags' }), values)

    const body = await contextualizedBody(tags, [tags])

    expect(findTermsClause(body.query, 'tags')).toEqual(['bar'])
  })

  it('applies both an unpaired filter own selection and the other filters', async () => {
    const values = { tags: ['bar'], language: ['ENGLISH'] }
    const tags = bindFilter(new FilterText({ name: 'tags', key: 'tags' }), values)
    const language = bindFilter(new FilterText({ name: 'language', key: 'language' }), values)

    const body = await contextualizedBody(tags, [tags, language])

    expect(findTermsClause(body.query, 'tags')).toEqual(['bar'])
    expect(findTermsClause(body.query, 'language')).toEqual(['ENGLISH'])
  })

  it('applies an unpaired filter own selection as a must_not when excluded', async () => {
    const values = { tags: ['bar'] }
    const tags = bindFilter(new FilterText({ name: 'tags', key: 'tags' }), values, { excluded: true })

    const body = await contextualizedBody(tags, [tags])

    // The buckets must drop the excluded values; FilterType re-adds them as
    // zero-count entries so they stay visible in the panel.
    expect(body.query.bool.filter.bool.must_not).toContainEqual({ terms: { tags: ['bar'] } })
  })

  it('excludes a paired filter own selection from its aggregation context', async () => {
    const values = { contentType: ['application/pdf'], contentTypeCategory: ['DOCUMENT'] }
    const contentType = bindFilter(new FilterText({ name: 'contentType', key: 'contentType' }), values)
    const category = bindFilter(new FilterText({ name: 'contentTypeCategory', key: 'contentTypeCategory' }), values)

    const body = await contextualizedBody(contentType, [contentType, category])

    expect(findTermsClause(body.query, 'contentType')).toBeNull()
    expect(findTermsClause(body.query, 'contentTypeCategory')).toEqual(['DOCUMENT'])
  })

  it('leaves the aggregation context unconstrained when not contextualized', async () => {
    const values = { tags: ['bar'] }
    const tags = bindFilter(new FilterText({ name: 'tags', key: 'tags' }), values)

    const spy = vi.spyOn(elasticsearch, '_search').mockResolvedValue({})
    await elasticsearch.searchFilter(index, tags, '', [tags], false)

    expect(findTermsClause(spy.mock.calls[0][0].body.query, 'tags')).toBeNull()
  })
})
