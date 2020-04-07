import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([
        {
          uuid: '12',
          project: { name: 'ProjectName' },
          description: 'This is the description of the batch search',
          queries: {
            query_01: 1,
            query_02: 3,
            query_03: 2
          },
          state: 'SUCCESS',
          date: '2019-07-18T14:45:34.869+0000'
        }, {
          uuid: '13',
          project: { name: 'ProjectName2' },
          description: 'Another description',
          queries: {
            query_04: 12
          },
          state: 'SUCCESS',
          date: '2019-07-28T14:45:34.869+0000'
        }
      ])),
      getBatchSearchResults: jest.fn().mockReturnValue(Promise.resolve([
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentPath: 'this/is/a/path/42',
          query: 'query_01',
          rootId: 42
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentPath: 'this/is/a/path/43',
          query: 'query_01',
          rootId: 43
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentPath: 'this/is/a/path/44',
          query: 'query_02',
          rootId: 44
        }
      ]))
    }
  })
})

const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()

describe('BatchSearchResultsFilters.vue', () => {
  const project = toLower('BatchSearchResultsFilters')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()

    store.commit('batchSearch/batchSearches', [{
      uuid: '12',
      project: { name: 'ProjectName' },
      description: 'This is the description of the batch search',
      queries: {
        query_01: 1,
        query_02: 3,
        query_03: 2
      },
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000'
    }, {
      uuid: '13',
      project: { name: 'ProjectName2' },
      description: 'Another description',
      queries: {
        query_04: 12
      },
      state: 'SUCCESS',
      date: '2019-07-28T14:45:34.869+0000'
    }])
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    jest.unmock('@/api')
  })

  it('should display simple list if there is only one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', index: project } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').text()).toMatch(/^query_04/)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeFalsy()
  })

  it('should display a selectable dropdown if there are more than one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span')).toHaveLength(3)
  })

  it('should add badge with query number of results on list', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', index: project } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__list span.badge')).toHaveLength(1)
    expect(wrapper.find('.batch-search-results-filters__queries__list span.badge').text()).toBe('12')
  })

  it('should add badge with query number of results on selectable dropdown', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span span.badge')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown > span span.badge').text()).toBe('3')
  })

  describe('search', () => {
    it('should display the "search" button', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches')
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__search')).toHaveLength(3)
    })

    it('should redirect to a search with project and query', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches')
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      wrapper.find('.batch-search-results-filters__queries__dropdown__item__search').trigger('click')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledWith({ name: 'search', query: { q: 'query_02', index: project } })
      spy.mockClear()
    })
  })

  describe('sort dropdown', () => {
    it('should display a dropdown to sort', () => {
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__sort .dropdown-menu')).toHaveLength(1)
    })

    it('should sort queries in default order ie. by count', () => {
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(0).text()).toBe('query_02')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(1).text()).toBe('query_03')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(2).text()).toBe('query_01')
    })

    it('should sort queries by "default" order ie. as in database', async () => {
      wrapper = await mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index: project } })
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      spy.mockClear()

      await wrapper.vm.sort('default')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledTimes(1)
      expect(wrapper.vm.$router.push).toBeCalledWith({ name: 'batch-search.results', query: { order: undefined, page: undefined, queries: [], queries_sort: 'default', sort: undefined } })
    })
  })
})
