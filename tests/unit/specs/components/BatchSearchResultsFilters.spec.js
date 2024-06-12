import { flushPromises, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchResultsFilters.vue', () => {
  let wrapper, core
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()

  const indices = [project, anotherProject].join(',')
  const propsMultipleQueries = {
    queryKeys: [
      { label: 'query_01', count: 1 },
      { label: 'query_02', count: 3 },
      { label: 'query_03', count: 2 }
    ],
    indices
  }
  const propsSingleQuery = { queryKeys: [{ label: 'query_04', count: 12 }], indices: project }

  beforeEach(async () => {
    const routes = [
      {
        name: 'task.batch-search.view.results',
        path: '/batch-search/:indices/:uuid'
      },
      {
        name: 'document-standalone',
        path: '/ds/:index/:id/:routing?'
      }
    ]
    core = CoreSetup.init().useAll().useRouter(routes)
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
  })

  it('should display simple list if there is only one query', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      global: {
        plugins: core.plugins
      },
      props: propsSingleQuery
    })
    await flushPromises()
    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').text()).toMatch(/^query_04/)
  })

  it('should display a selectable dropdown if there are more than one query', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      global: {
        plugins: core.plugins
      },
      props: propsMultipleQueries
    })
    await flushPromises()

    expect(wrapper.find('.batch-search-results-filters__queries').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item')).toHaveLength(3)
  })

  it('should add badge with query number of results on list', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      global: {
        plugins: core.plugins
      },
      props: propsSingleQuery
    })
    await flushPromises()

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown span.badge')).toHaveLength(1)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown span.badge').text()).toBe('12')
  })

  it('should add badge with query number of results on selectable dropdown', async () => {
    wrapper = mount(BatchSearchResultsFilters, {
      global: {
        plugins: core.plugins
      },
      props: propsMultipleQueries
    })
    await flushPromises()

    expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__count')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-filters__queries__dropdown__item__count').text()).toBe('3')
  })

  describe('search', () => {
    it('should display the "search" button', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: {
          plugins: core.plugins
        },
        props: propsMultipleQueries
      })
      await flushPromises()

      expect(wrapper.findAll('.batch-search-results-filters__queries__dropdown__item__search')).toHaveLength(3)
    })

    it('should redirect to a search with project and query', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: {
          plugins: core.plugins
        },
        props: propsMultipleQueries
      })
      await flushPromises()
      const spy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue(null)
      wrapper.find('.batch-search-results-filters__queries__dropdown__item__search').trigger('click')

      expect(wrapper.vm.$router.push).toBeCalledWith({
        name: 'search',
        query: { q: 'query_02', indices: project.concat(',', anotherProject), queries: [] }
      })
      spy.mockClear()
    })
  })

  describe('sort queries', () => {
    it('should display a dropdown to sort', () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: { plugins: core.plugins },
        props: propsMultipleQueries
      })

      expect(wrapper.findAll('.batch-search-results-filters__queries__sort .dropdown-menu')).toHaveLength(1)
    })

    it('should sort queries in default order ie. by count', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: { plugins: core.plugins },
        props: propsMultipleQueries
      })
      await flushPromises()

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
      wrapper = mount(BatchSearchResultsFilters, {
        global: { plugins: core.plugins },
        props: propsMultipleQueries
      })
      const spy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue(null)
      spy.mockClear()

      await wrapper.vm.sort('default')

      expect(wrapper.vm.$router.push).toBeCalledTimes(1)
      expect(wrapper.vm.$router.push).toBeCalledWith({
        name: 'task.batch-search.view.results',
        query: { order: undefined, page: undefined, queriesSort: 'default', sort: undefined }
      })
    })

    it('adds exclude selected queries filter', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: { plugins: core.plugins },
        props: propsMultipleQueries
      })
      const spy = vi.spyOn(wrapper.vm.$router, 'push').mockResolvedValue(null)
      spy.mockClear()

      const excludeFilter = wrapper.find('.filter__footer__action--exclude input')
      expect(excludeFilter.exists()).toBeTruthy()
      await excludeFilter.setChecked(true)

      expect(wrapper.vm.$router.push).toBeCalledTimes(1)
      expect(wrapper.vm.$router.push).toBeCalledWith({
        name: 'task.batch-search.view.results',
        query: { queriesExcluded: true }
      })
    })
  })

  describe('filter queries', () => {
    it('should filter queries when search bar is filled', async () => {
      wrapper = mount(BatchSearchResultsFilters, {
        global: { plugins: core.plugins },
        props: propsMultipleQueries
      })
      await flushPromises()
      expect(wrapper.findAll('.recycle_scroller-item--active')).toHaveLength(3)
      await wrapper.setData({ queriesFilter: '2' })
      await flushPromises()
      expect(wrapper.vm.filteredQueries).toHaveLength(1)
      expect(wrapper.vm.filteredQueries[0]).toEqual({ count: 3, label: 'query_02' })
      expect(wrapper.findAll('.recycle_scroller-item--active')).toHaveLength(1)
      expect(wrapper.findAll('.recycle_scroller-item--active').at(0).text()).toMatch(/^query_02/)
    })
  })
})
