import toLower from 'lodash/toLower'
import { createLocalVue, createWrapper, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { App } from '@/main'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

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

const { localVue, router, store } = App.init(createLocalVue()).useAll()

describe('BatchSearchResultsFilters.vue', () => {
  const index = toLower('BatchSearchResultsFilters')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', index).withContentType('type_01')).commit()

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

  it('should emit a "batch-search-results::filter" event on click on dropdown entry', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })
    const rootWrapper = createWrapper(wrapper.vm.$root)
    rootWrapper._emitted['batch-search-results::filter'] = []

    wrapper.find('.batch-search-results-filters__queries__dropdown > span').trigger('click')
    await wrapper.vm.$nextTick()

    expect(rootWrapper.emitted('batch-search-results::filter')).toHaveLength(1)
  })

  it('should display simple list if there is only one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', index }, mocks: { $t: msg => msg, $n: msg => msg } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__list').text()).toMatch(/^query_04/)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeFalsy()
  })

  it('should display a selectable dropdown if there are more than one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span')).toHaveLength(3)
  })

  it('should add badge with query number of results on list', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', index }, mocks: { $t: msg => msg, $n: msg => msg } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__list span.badge')).toHaveLength(1)
    expect(wrapper.find('.batch-search-results-filters__queries__list span.badge').text()).toBe('12')
  })

  it('should add badge with query number of results on selectable dropdown', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches')
    wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span span.badge')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown > span span.badge').text()).toBe('1')
  })

  describe('search', () => {
    it('should display the "search" button', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches')
      wrapper = mount(BatchSearchResultsFilters, { localVue, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__search')).toHaveLength(3)
    })

    it('should redirect to a search', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches')
      wrapper = mount(BatchSearchResultsFilters, { localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })
      jest.spyOn(wrapper.vm.$router, 'push')

      wrapper.find('.batch-search-results-filters__queries__dropdown__item__search').trigger('click')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledWith({ name: 'search', query: { q: 'query_01' } })
    })
  })

  describe('sort dropdown', () => {
    it('should display a dropdown to sort', () => {
      wrapper = mount(BatchSearchResultsFilters, { localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__sort .dropdown-menu')).toHaveLength(1)
    })

    it('should sort queries in default order', () => {
      wrapper = mount(BatchSearchResultsFilters, { localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(0).text()).toBe('query_01')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(1).text()).toBe('query_02')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(2).text()).toBe('query_03')
    })

    it('should sort queries by count order', async () => {
      wrapper = mount(BatchSearchResultsFilters, { localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', index }, mocks: { $t: msg => msg, $n: msg => msg } })

      await wrapper.vm.sort('count')

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(0).text()).toBe('query_02')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(1).text()).toBe('query_03')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item > span:not(.badge)').at(2).text()).toBe('query_01')
    })
  })
})
