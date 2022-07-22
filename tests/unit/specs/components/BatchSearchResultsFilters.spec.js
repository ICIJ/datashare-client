import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/api', () => {
  const batchSearches = {
    12: {
      uuid: '12',
      projects: [{ name: 'ProjectName' }, { name: 'ProjectName2' }],
      description: 'This is the description of the batch search',
      queries: {
        query_01: 1,
        query_02: 3,
        query_03: 2
      },
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000'
    },
    13: {
      uuid: '13',
      projects: [{ name: 'ProjectName2' }],
      description: 'Another description',
      queries: {
        query_04: 12
      },
      state: 'SUCCESS',
      date: '2019-07-28T14:45:34.869+0000'
    }
  }

  return jest.fn(() => {
    return {
      // Mock user session
      getUser: jest.fn().mockResolvedValue({ uid: 'doe' }),
      // Mock request to get one specific batch search
      getBatchSearch: uuid => Promise.resolve(batchSearches[uuid]),
      // Mock request to get all batch search
      getBatchSearches: jest.fn().mockReturnValue(Object.values(batchSearches)),
      getBatchSearchResults: jest.fn().mockReturnValue([
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentPath: 'this/is/a/path/42',
          query: 'query_01',
          project: 'ProjectName',
          rootId: 42
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentPath: 'this/is/a/path/43',
          query: 'query_01',
          project: 'ProjectName2',
          rootId: 43
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentPath: 'this/is/a/path/44',
          query: 'query_02',
          project: 'ProjectName',
          rootId: 44
        }
      ])
    }
  })
})

describe('BatchSearchResultsFilters.vue', () => {
  const { i18n, localVue, router, store } = Core.init(createLocalVue()).useAll()
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  let wrapper = null

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()

    store.commit('batchSearch/batchSearches', [{
      uuid: '12',
      projects: [{ name: 'ProjectName' }, { name: 'ProjectName2' }],
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
      projects: [{ name: 'ProjectName2' }],
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
    await store.dispatch('batchSearch/getBatchSearches', {})
    await store.dispatch('batchSearch/getBatchSearch', '13')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', indices: project } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').text()).toMatch(/^query_04/)
  })

  it('should display a selectable dropdown if there are more than one query', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches', {})
    await store.dispatch('batchSearch/getBatchSearch', '12')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [{ name: project }, { name: anotherProject }] } })

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span')).toHaveLength(3)
  })

  it('should add badge with query number of results on list', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '13', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches', {})
    await store.dispatch('batchSearch/getBatchSearch', '13')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '13', indices: project } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown span.badge')).toHaveLength(1)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown span.badge').text()).toBe('12')
  })

  it('should add badge with query number of results on selectable dropdown', async () => {
    await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
    await store.dispatch('batchSearch/getBatchSearches', {})
    await store.dispatch('batchSearch/getBatchSearch', '12')
    wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown > span span.badge')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown > span span.badge').text()).toBe('3')
  })

  describe('search', () => {
    it('should display the "search" button', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches', {})
      await store.dispatch('batchSearch/getBatchSearch', '12')
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__search')).toHaveLength(3)
    })

    it('should redirect to a search with project and query', async () => {
      await store.dispatch('batchSearch/getBatchSearchResults', '12', 0, 100)
      await store.dispatch('batchSearch/getBatchSearches', {})
      await store.dispatch('batchSearch/getBatchSearch', '12')
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      wrapper.find('.batch-search-results-filters__queries__dropdown__item__search').trigger('click')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledWith({ name: 'search', query: { q: 'query_02', indices: project.concat(',', anotherProject) } })
      spy.mockClear()
    })
  })

  describe('sort queries', () => {
    it('should display a dropdown to sort', () => {
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__sort .dropdown-menu')).toHaveLength(1)
    })

    it('should sort queries in default order ie. by count', () => {
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(0).text()).toBe('query_02')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(1).text()).toBe('query_03')
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(2).text()).toBe('query_01')
    })

    it('should sort queries by "default" order ie. as in database', async () => {
      wrapper = await mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      spy.mockClear()

      await wrapper.vm.sort('default')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledTimes(1)
      expect(wrapper.vm.$router.push).toBeCalledWith({ name: 'batch-search.results', query: { order: undefined, page: undefined, queries_sort: 'default', sort: undefined } })
    })
  })

  describe('filter queries', () => {
    it('should filter queries when search bar is filled', async () => {
      wrapper = mount(BatchSearchResultsFilters, { i18n, localVue, router, store, computed: { downloadLink () { return 'mocked-download-link' } }, propsData: { uuid: '12', indices: [project, anotherProject] } })
      await wrapper.setData({ queriesFilter: '2' })
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(1)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(0).text()).toBe('query_02')
    })
  })
})
