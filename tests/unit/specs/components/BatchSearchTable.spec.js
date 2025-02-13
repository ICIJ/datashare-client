import { removeCookie, setCookie } from 'tiny-cookie'
import { mount, shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import BatchSearchTable from '@/components/BatchSearchTable'

const batchSearchMock = {
  items: [
    {
      uuid: '1',
      projects: ['project_01', 'project_02'],
      name: 'name_01',
      description: 'description_01',
      date: '2019-01-01',
      nbResults: 2,
      nbQueries: 1,
      state: 'SUCCESS'
    },
    {
      uuid: '2',
      projects: ['project_02'],
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

const routeFactory = function (args) {
  return {
    name: 'task.batch-search.list',
    query: { page: 1, sort: 'batch_date', order: 'desc', field: 'all', ...args }
  }
}

describe('BatchSearchTable.vue', () => {
  let core, api

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    api = { getBatchSearches: vi.fn().mockResolvedValue(batchSearchMock) }
    core = CoreSetup.init(api).useAll().useRouterWithoutGuards()
    core.config.set('projects', [{ name: 'project_01' }, { name: 'project_02' }])
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  describe('common functions', () => {
    beforeAll(async () => {
      core.config.merge({ mode: 'SERVER' })
      await flushPromises()
    })

    describe('Display elements', () => {
      let wrapper

      beforeEach(async () => {
        wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
        await flushPromises()
      })

      it('display the batch search table batchSearches', () => {
        expect(wrapper.find('.batch-search-table').exists()).toBeTruthy()
      })

      it('should list the batchSearches', () => {
        expect(wrapper.findAll('.batch-search-table__item')).toHaveLength(2)
      })

      it('should display the number of queries per batchSearch', () => {
        expect(wrapper.findAll('.batch-search-table__item__queries').at(0).text()).toBe('1')
        expect(wrapper.findAll('.batch-search-table__item__queries').at(1).text()).toBe('2')
      })

      it('should display a pagination when perPage inferior to 2', async () => {
        await wrapper.setData({ perPage: 1 })
        expect(wrapper.findComponent({ name: 'tiny-pagination' }).exists()).toBeTruthy()
        expect(wrapper.vm.numberOfPages).toBe(2)
        await wrapper.setData({ perPage: 5 })
        expect(wrapper.findComponent({ name: 'tiny-pagination' }).exists()).toBeFalsy()
      })

      describe('empty store', () => {
        let wrapper

        beforeEach(async () => {
          setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)

          const state = { batchSearches: [] }
          const actions = { getBatchSearches: vi.fn() }
          const storeOptions = { modules: { batchSearch: { namespaced: true, state, actions } } }

          api = { getBatchSearches: vi.fn().mockResolvedValue(batchSearchMock) }
          const { plugins } = CoreSetup.init(api).useAll().useVuex(storeOptions).useRouterWithoutGuards()

          wrapper = mount(BatchSearchTable, { global: { plugins } })
          await flushPromises()
        })

        it("should display a 'No result' message when no items", async () => {
          expect(wrapper.find('.batch-search-table__item__no-item').exists()).toBeTruthy()
          expect(wrapper.find('b-pagination-nav-stub').exists()).toBeFalsy()
        })
      })
    })

    describe('Dispatch batch search request', () => {
      let core

      beforeAll(() => {
        core = CoreSetup.init(api).useAll().useRouterWithoutGuards()
      })

      it('should fetch the batch search page with the state filtered', async () => {
        const computed = { ...BatchSearchTable.computed, selectedStates: () => ['RUNNING', 'FAILURE'] }
        const wrapper = shallowMount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
        await flushPromises()
        vi.spyOn(core.store, 'dispatch')

        await wrapper.vm.fetch()
        expect(core.store.dispatch).toBeCalled()
        expect(core.store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
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
        const computed = { ...BatchSearchTable.computed, selectedProjects: () => ['project_02'] }
        const wrapper = shallowMount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
        await flushPromises()
        vi.spyOn(core.store, 'dispatch')

        await wrapper.vm.fetch()
        expect(core.store.dispatch).toBeCalled()
        expect(core.store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
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
        const computed = { ...BatchSearchTable.computed, selectedDateRange: () => ({ start: 0, end: 1 }) }
        const wrapper = shallowMount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
        await flushPromises()

        vi.spyOn(core.store, 'dispatch')
        await wrapper.vm.fetch()
        expect(core.store.dispatch).toBeCalledWith('batchSearch/getBatchSearches', {
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
      let wrapper, core

      beforeEach(async () => {
        core = CoreSetup.init(api).useAll().useRouterWithoutGuards()
        core.config.set('projects', [])
        wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
        await flushPromises()
      })

      it('set selected sort', () => {
        expect(wrapper.vm.selectedSort).toEqual({ sort: 'batch_date', order: 'desc' })
        vi.spyOn(core.router, 'push')
        wrapper.vm.selectedSort = { sort: 'nbResults', order: 'asc' }
        expect(core.router.push).toBeCalledTimes(1)
        expect(core.router.push).toBeCalledWith(routeFactory({ sort: 'nbResults', order: 'asc' }))
      })

      it('set selectedProjects', () => {
        expect(wrapper.vm.selectedProjects).toEqual([])
        vi.spyOn(core.router, 'push')
        wrapper.vm.selectedProjects = ['test', 'toto']
        expect(core.router.push).toBeCalledTimes(1)
        const query = expect.objectContaining({ project: 'test,toto' })
        expect(core.router.push).toBeCalledWith(expect.objectContaining({ query }))
      })

      it('set selectedDate', () => {
        expect(wrapper.vm.selectedDateRange).toEqual(null)
        vi.spyOn(core.router, 'push')
        wrapper.vm.selectedDateRange = { start: 0, end: 1 }
        expect(core.router.push).toBeCalledTimes(1)
        const query = expect.objectContaining({ dateStart: 0, dateEnd: 1 })
        expect(core.router.push).toBeCalledWith(expect.objectContaining({ query }))
      })

      it('set selectedState', () => {
        expect(wrapper.vm.selectedStates).toEqual([])
        vi.spyOn(core.router, 'push')
        wrapper.vm.selectedStates = ['QUEUED', 'RUNNING']
        expect(core.router.push).toBeCalledTimes(1)
        const query = expect.objectContaining({ state: 'QUEUED,RUNNING' })
        expect(core.router.push).toBeCalledWith(expect.objectContaining({ query }))
      })

      it('set selectedStatus', () => {
        expect(wrapper.vm.selectedStatus).toEqual(null)
        vi.spyOn(core.router, 'push')
        wrapper.vm.selectedStatus = { label: 'published', value: '1' }
        expect(core.router.push).toBeCalledTimes(1)
        const query = expect.objectContaining({ publishState: '1' })
        expect(core.router.push).toBeCalledWith(expect.objectContaining({ query }))
      })
    })

    describe('Retrieve values from search params', () => {
      let core

      beforeEach(async () => {
        core = CoreSetup.init(api).useAll().useRouterWithoutGuards()
        core.config.set('projects', [{ name: 'projectA' }, { name: 'projectB' }])
        await flushPromises()
      })

      it('get params with accepted values', async () => {
        await core.router.push({
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
        const computed = { ...BatchSearchTable.computed, projects: () => ['projectA', 'projectB', 'projectC'] }
        const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
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
        await core.router.push({
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

        const computed = { ...BatchSearchTable.computed, projects: () => ['projectA', 'projectC'] }
        const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
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
        await core.router.push({
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

        const computed = { ...BatchSearchTable.computed, projects: () => ['projectA', 'projectB', 'projectC'] }
        const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins }, computed })
        await flushPromises()

        await core.router.push({
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
        const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
        await flushPromises()

        expect(wrapper.vm.search).toBe('')

        const fetchSpy = vi.spyOn(wrapper.vm, 'fetch')
        expect(fetchSpy).not.toBeCalled()

        await core.router.push({
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
    beforeEach(() => {
      core.config.merge({ mode: 'SERVER' })
    })

    it('should display 8 columns of info per row', () => {
      const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
      const columns = wrapper.findAll('.batch-search-table__head [scope=col]')
      expect(columns).toHaveLength(8)
    })

    it('should display projects names in the batch search results url', async () => {
      const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
      await flushPromises()
      const link = wrapper.findAll('.batch-search-table__item__link').at(0)
      expect(link.attributes('href')).toContain('/project_01,project_02/')
    })

    it('the Projects column should be the last one', () => {
      const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
      const columns = wrapper.findAll('.batch-search-table__head [scope=col]')
      expect(columns.at(7).text()).toBe('Projects')
    })

    it('all projects should be displayed and clickable for a multiproject search', async () => {
      const wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
      await flushPromises()
      const projects = wrapper.find('.batch-search-table__item__projects')
      const projectsLinks = projects.findAllComponents({ name: 'ProjectLink' })
      expect(projectsLinks).toHaveLength(2)
      expect(projectsLinks.at(0).element.tagName).toBe('A')
      expect(projectsLinks.at(1).element.tagName).toBe('A')
    })
  })

  describe('LOCAL mode with no projects', () => {
    let wrapper

    beforeEach(async () => {
      core.config.merge({ mode: 'LOCAL', projects: [] })
      wrapper = mount(BatchSearchTable, { global: { plugins: core.plugins } })
      await flushPromises()
    })

    it('should NOT display project name in the batch search results url', () => {
      expect(wrapper.findAll('.batch-search-table__item').at(0).find('td[aria-colindex="3"] a').exists()).toBeFalsy()
    })

    it('should display 5 columns of info per row', () => {
      const columns = wrapper.findAll('.batch-search-table__head [scope="col"]')
      expect(columns).toHaveLength(5)
    })
  })
})
