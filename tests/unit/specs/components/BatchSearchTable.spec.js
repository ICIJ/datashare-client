import Murmur from '@icij/murmur'
import { removeCookie, setCookie } from 'tiny-cookie'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import { Core } from '@/core'
import BatchSearchTable from '@/components/BatchSearchTable'

const batchSearchMock = {
  items: [
    {
      uuid: '1',
      projects: [{ name: 'project_01' }, { name: 'project_02' }],
      name: 'name_01',
      description: 'description_01',
      date: '2019-01-01',
      nbResults: 2,
      nbQueries: 1,
      state: 'SUCCESS'
    },
    {
      uuid: '2',
      projects: [{ name: 'project_02' }],
      name: 'name_02',
      description: 'description_02',
      date: '2019-01-01',
      nbResults: 3,
      nbQueries: 2,
      state: 'FAILURE'
    }
  ],
  pagination: { total: 2 }
}
const routerFactory = () => {
  return new VueRouter({
    routes: [
      {
        name: 'task.batch-search.list',
        path: 'batch-search'
      },
      {
        name: 'task.batch-search.view.results',
        path: 'batch-search/:index/:uuid'
      }
    ],
    mode: 'abstract'
  })
}

const routeFactory = function (args) {
  return {
    name: 'task.batch-search.list',
    query: { page: 1, sort: 'batch_date', order: 'desc', field: 'all', ...args }
  }
}

describe('BatchSearchTable.vue', () => {
  let wrapper, i18n, localVue, store, wait, api

  beforeAll(() => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)

    api = {
      getBatchSearches: jest.fn().mockResolvedValue(batchSearchMock)
    }

    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  afterAll(() => removeCookie(process.env.VUE_APP_DS_COOKIE_NAME))

  describe('common functions', () => {
    beforeAll(async () => {
      Murmur.config.merge({ mode: 'SERVER' })
      await flushPromises()
    })
    describe('Display elements', () => {
      beforeEach(async () => {
        wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
        await flushPromises()
      })
      it('display the batch search table batchSearches', () => {
        expect(wrapper.find('.batch-search-table').exists()).toBeTruthy()
      })
      it('should list the batchSearches', async () => {
        expect(wrapper.findAll('.batch-search-table__item')).toHaveLength(2)
      })

      it('should display the number of queries per batchSearch', () => {
        expect(wrapper.findAll('.batch-search-table__item__queries').at(0).text()).toBe('1')
        expect(wrapper.findAll('.batch-search-table__item__queries').at(1).text()).toBe('2')
      })

      it('should display a pagination when perPage inferior to 2', async () => {
        await wrapper.setData({ perPage: 1 })
        expect(wrapper.find('.pagination.b-pagination').exists()).toBeTruthy()
        expect(wrapper.vm.numberOfPages).toBe(2)
        await wrapper.setData({ perPage: 5 })
        expect(wrapper.find('.pagination.b-pagination').exists()).toBeFalsy()
      })
      it("should display a 'No result' message when no items", async () => {
        const state = { batchSearches: [] }
        const actions = { getBatchSearches: jest.fn() }
        const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions } } })

        wrapper = mount(BatchSearchTable, { i18n, localVue, store, wait })
        await flushPromises()
        expect(wrapper.find('.batch-search-table__item__no-item').exists()).toBeTruthy()
        expect(wrapper.find('b-pagination-nav-stub').exists()).toBeFalsy()
      })
    })

    describe('Dispatch batch search request', () => {
      it('should fetch the batch search page with the state filtered', async () => {
        const computed = { selectedStates: () => ['RUNNING', 'FAILURE'] }
        wrapper = shallowMount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, computed, wait })
        await flushPromises()
        jest.spyOn(store, 'dispatch')
        // THEN
        await wrapper.vm.fetch()
        expect(store.dispatch).toBeCalled()
        expect(store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
          from: 0,
          size: 100,
          query: '',
          sort: 'batch_date',
          order: 'desc',
          field: 'all',
          batchDate: null,
          project: [],
          state: ['RUNNING', 'FAILURE'],
          publishState: null
        })
      })

      it('should fetch to the batch search page with the project filter', async () => {
        const computed = { selectedProjects: () => ['project_02'] }
        wrapper = shallowMount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, computed, wait })
        await flushPromises()
        jest.spyOn(store, 'dispatch')
        // THEN
        await wrapper.vm.fetch()

        expect(store.dispatch).toBeCalled()
        expect(store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
          from: 0,
          size: 100,
          query: '',
          sort: 'batch_date',
          order: 'desc',
          field: 'all',
          batchDate: null,
          project: ['project_02'],
          state: [],
          publishState: null
        })
      })
      it('should fetch to the batch search page with the date filter', async () => {
        const computed = { selectedDateRange: () => ({ start: 0, end: 1 }) }
        wrapper = shallowMount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, computed, wait })
        await flushPromises()
        // THEN
        jest.spyOn(store, 'dispatch')
        await wrapper.vm.fetch()
        expect(store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
          from: 0,
          size: 100,
          query: '',
          sort: 'batch_date',
          order: 'desc',
          field: 'all',
          batchDate: ['0', '1'],
          project: [],
          state: [],
          publishState: null
        })
      })
    })

    describe('Update URL Search params', () => {
      let router = null
      beforeEach(async () => {
        router = routerFactory()
        wrapper = mount(BatchSearchTable, { i18n, localVue, router, store, wait })
        await flushPromises()
      })
      it('set selected sort', () => {
        expect(wrapper.vm.selectedSort).toEqual({ sort: 'batch_date', order: 'desc' })
        jest.spyOn(router, 'push')
        wrapper.vm.selectedSort = { sort: 'nbResults', order: 'asc' }
        expect(router.push).toBeCalledTimes(1)
        expect(router.push).toBeCalledWith(routeFactory({ sort: 'nbResults', order: 'asc' }))
      })

      it('set selectedProjects', () => {
        expect(wrapper.vm.selectedProjects).toEqual([])
        jest.spyOn(router, 'push')
        wrapper.vm.selectedProjects = ['test', 'toto']
        expect(router.push).toBeCalledTimes(1)
        expect(router.push).toBeCalledWith(routeFactory({ project: 'test,toto' }))
        wrapper.vm.selectedProjects = []
        expect(router.push).toBeCalledWith(routeFactory())
      })

      it('set selectedDate', () => {
        expect(wrapper.vm.selectedDateRange).toEqual(null)
        jest.spyOn(router, 'push')
        wrapper.vm.selectedDateRange = { start: 0, end: 1 }
        expect(router.push).toBeCalledTimes(1)
        expect(router.push).toBeCalledWith(routeFactory({ dateStart: 0, dateEnd: 1 }))
        wrapper.vm.selectedDateRange = null
        expect(router.push).toBeCalledWith(routeFactory())
      })

      it('set selectedState', () => {
        expect(wrapper.vm.selectedStates).toEqual([])
        jest.spyOn(router, 'push')
        wrapper.vm.selectedStates = ['QUEUED', 'RUNNING']
        expect(router.push).toBeCalledTimes(1)
        expect(router.push).toBeCalledWith(routeFactory({ state: 'QUEUED,RUNNING' }))
        wrapper.vm.selectedStates = []
        expect(router.push).toBeCalledWith(routeFactory())
      })

      it('set selectedStatus', () => {
        expect(wrapper.vm.selectedStatus).toEqual(null)
        jest.spyOn(router, 'push')
        wrapper.vm.selectedStatus = { label: 'published', value: '1' }
        expect(router.push).toBeCalledTimes(1)
        expect(router.push).toBeCalledWith(routeFactory({ publishState: '1' }))
        wrapper.vm.selectedStatus = null
        expect(router.push).toBeCalledWith(routeFactory())
      })
    })

    describe('Retrieve values from search params', () => {
      let router = null
      beforeEach(() => {
        router = routerFactory()
      })
      it('get params with accepted values', async () => {
        await router.push({
          name: 'task.batch-search.list',
          query: {
            query: 'test',
            page: 2,
            field: 'name',
            sort: 'batch_results',
            order: 'asc',
            project: 'projectA,projectB',
            state: ['QUEUED', 'RUNNING'],
            dateStart: 0,
            dateEnd: 1
          }
        })
        const computed = { projects: () => ['projectA', 'projectB', 'projectC'] }
        wrapper = mount(BatchSearchTable, { i18n, localVue, router, store, wait, computed })
        await flushPromises()

        expect(wrapper.vm.search).toBe('test')
        expect(wrapper.vm.fieldValue).toBe('name')
        expect(wrapper.vm.page).toEqual(2)
        expect(wrapper.vm.order).toEqual('asc')
        expect(wrapper.vm.sort).toEqual('batch_results')
        expect(wrapper.vm.selectedSort).toEqual({ sort: 'batch_results', order: 'asc' })
        expect(wrapper.vm.selectedProjects).toEqual(['projectA', 'projectB'])
        expect(wrapper.vm.selectedStates).toEqual(['QUEUED', 'RUNNING'])
      })

      it('get params with invalid values', async () => {
        await router.push({
          name: 'task.batch-search.list',
          query: {
            page: -1,
            sort: 'not_existing_sort',
            field: 'not_existing_field',
            order: 'not_existing_order',
            project: 'projectA,not_existing_project',
            state: 'not_existing_state',
            dateStart: 0
          }
        })
        const computed = { projects: () => ['projectA', 'projectC'] }
        wrapper = mount(BatchSearchTable, { i18n, localVue, router, store, wait, computed })
        await flushPromises()

        expect(wrapper.vm.search).toBe('')
        expect(wrapper.vm.fieldValue).toBe('all')
        expect(wrapper.vm.page).toEqual(1)
        expect(wrapper.vm.order).toEqual('desc')
        expect(wrapper.vm.sort).toEqual('batch_date')
        expect(wrapper.vm.selectedSort).toEqual({ sort: 'batch_date', order: 'desc' })
        expect(wrapper.vm.selectedProjects).toEqual(['projectA'])
        expect(wrapper.vm.selectedStates).toEqual([])
      })
      it('clear all filters in table', async () => {
        // GIVEN
        await router.push({
          name: 'task.batch-search.list',
          query: {
            query: 'test',
            page: 2,
            sort: 'batch_results',
            order: 'asc',
            project: 'projectA,projectB',
            state: ['QUEUED', 'RUNNING'],
            dateStart: 0,
            dateEnd: 1
          }
        })
        const computed = { projects: () => ['projectA', 'projectB', 'projectC'] }
        wrapper = mount(BatchSearchTable, { i18n, localVue, router, store, wait, computed })
        await flushPromises()

        // THEN
        await router.push({
          name: 'task.batch-search.list',
          query: {}
        })
        expect(wrapper.vm.search).toBe('')
        expect(wrapper.vm.page).toEqual(1)
        expect(wrapper.vm.order).toEqual('desc')
        expect(wrapper.vm.sort).toEqual('batch_date')
        expect(wrapper.vm.selectedSort).toEqual({ sort: 'batch_date', order: 'desc' })
        expect(wrapper.vm.selectedProjects).toEqual([])
        expect(wrapper.vm.selectedStates).toEqual([])
        expect(wrapper.vm.selectedDateRange).toEqual(null)
      })
      it('should execute "fetch" on query change', async () => {
        wrapper = mount(BatchSearchTable, { i18n, localVue, router, store, wait })
        await flushPromises()
        expect(wrapper.vm.search).toBe('')
        const fetchSpy = jest.spyOn(wrapper.vm, 'fetch')
        expect(fetchSpy).not.toBeCalled()
        await router.push({
          name: 'task.batch-search.list',
          query: {
            query: 'new search'
          }
        })
        expect(wrapper.vm.search).toBe('new search')
        expect(fetchSpy).toBeCalled()
      })
    })
  })

  describe('SERVER mode', () => {
    beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

    it('should display 8 columns of info per row', () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      const columns = wrapper.findAll('.batch-search-table__head [role="columnheader"]')
      expect(columns).toHaveLength(8)
    })

    it('should display projects names in the batch search results url', async () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      await flushPromises()
      const link = wrapper.findAll('.batch-search-table__item__link').at(0)
      expect(link.attributes('href')).toContain('/project_01,project_02/')
    })

    it('the Projects column should be the last one', () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      const columns = wrapper.findAll('.batch-search-table__head [role="columnheader"]')
      expect(columns.at(7).text()).toBe('Projects')
    })

    it('all projects should be displayed and clickable for a multiproject search', async () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      await flushPromises()
      const projects = wrapper.find('.batch-search-table__item__projects')
      const projectsLinks = projects.findAllComponents({ name: 'ProjectLink' })
      expect(projectsLinks).toHaveLength(2)
      expect(projectsLinks.at(0).element.tagName).toBe('A')
      expect(projectsLinks.at(1).element.tagName).toBe('A')
    })
  })

  describe('LOCAL mode', () => {
    beforeAll(() => Murmur.config.merge({ mode: 'LOCAL' }))

    it('should NOT display project name in the batch search results url', async () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      await flushPromises()
      expect(wrapper.find('.batch-search-table__item:nth-child(1) td[aria-colindex="3"] a').exists()).toBeFalsy()
    })

    it('should display 5 columns of info per row', () => {
      wrapper = mount(BatchSearchTable, { i18n, localVue, router: routerFactory(), store, wait })
      const columns = wrapper.findAll('.batch-search-table__head [role="columnheader"]')
      expect(columns).toHaveLength(5)
    })
  })
})
