import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import { Core } from '@/core'
import { Api } from '@/api'

describe('BatchSearchResultsFilters.vue', () => {
  let i18n, localVue, router, store, api
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  const propsDataMultipleQueries = {
    queryKeys: [
      { label: 'query_01', count: 1 },
      { label: 'query_02', count: 3 },
      { label: 'query_03', count: 2 }
    ],
    indices: [project, anotherProject]
  }
  const propsDataSingleQuery = { queryKeys: [{ label: 'query_04', count: 12 }], indices: project }

  let wrapper = null

  beforeAll(() => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    api = new Api(null, null)

    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    store = core.store
    localVue = core.localVue
    router = core.router
  })

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display simple list if there is only one query', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      i18n,
      localVue,
      router,
      store,
      computed: {
        downloadLink() {
          return 'mocked-download-link'
        }
      },
      propsData: propsDataSingleQuery
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').text()).toMatch(/^query_04/)
  })

  it('should display a selectable dropdown if there are more than one query', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      i18n,
      localVue,
      router,
      store,
      computed: {
        downloadLink() {
          return 'mocked-download-link'
        }
      },
      propsData: propsDataMultipleQueries
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
  })

  it('should add badge with query number of results on list', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      i18n,
      localVue,
      router,
      store,
      computed: {
        downloadLink() {
          return 'mocked-download-link'
        }
      },
      propsData: propsDataSingleQuery
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown span.badge')).toHaveLength(1)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown span.badge').text()).toBe('12')
  })

  it('should add badge with query number of results on selectable dropdown', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      i18n,
      localVue,
      router,
      store,
      computed: {
        downloadLink() {
          return 'mocked-download-link'
        }
      },
      propsData: propsDataMultipleQueries
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__count')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown__item__count').text()).toBe('3')
  })

  describe('search', () => {
    it('should display the "search" button', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__search')).toHaveLength(3)
    })

    it('should redirect to a search with project and query', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })
      await wrapper.vm.$nextTick()
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      wrapper.find('.batch-search-results-filters__queries__dropdown__item__search').trigger('click')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledWith({
        name: 'search',
        query: { q: 'query_02', indices: project.concat(',', anotherProject) }
      })
      spy.mockClear()
    })
  })

  describe('sort queries', () => {
    it('should display a dropdown to sort', () => {
      wrapper = mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })

      expect(wrapper.findAll('.batch-search-results-filters__queries__sort .dropdown-menu')).toHaveLength(1)
    })

    it('should sort queries in default order ie. by count', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(0).text()).toBe(
        'query_02'
      )
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(1).text()).toBe(
        'query_03'
      )
      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__label').at(2).text()).toBe(
        'query_01'
      )
    })

    it('should sort queries by "default" order ie. as in database', async () => {
      wrapper = await mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })
      const spy = jest.spyOn(wrapper.vm.$router, 'push')
      spy.mockClear()

      await wrapper.vm.sort('default')

      expect(wrapper.vm.$router.push).toBeCalled()
      expect(wrapper.vm.$router.push).toBeCalledTimes(1)
      expect(wrapper.vm.$router.push).toBeCalledWith({
        name: 'batch-search.results',
        query: { order: undefined, page: undefined, queries_sort: 'default', sort: undefined }
      })
    })
  })

  describe('filter queries', () => {
    it('should filter queries when search bar is filled', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        i18n,
        localVue,
        router,
        store,
        computed: {
          downloadLink() {
            return 'mocked-download-link'
          }
        },
        propsData: propsDataMultipleQueries
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.recycle_scroller-item--active')).toHaveLength(3)
      await wrapper.setData({ queriesFilter: '2' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.filteredQueries).toHaveLength(1)
      expect(wrapper.vm.filteredQueries[0]).toEqual({ count: 3, label: 'query_02' })
      expect(wrapper.findAll('.recycle_scroller-item--active')).toHaveLength(1)
      expect(wrapper.findAll('.recycle_scroller-item--active').at(0).text()).toMatch(/^query_02/)
    })
  })
})
