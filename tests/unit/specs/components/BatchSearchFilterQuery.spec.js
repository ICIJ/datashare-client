import { shallowMount, mount } from '@vue/test-utils'

import BatchSearchFilterQuery from '@/components/BatchSearchFilterQuery'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchFilterQuery.vue', () => {
  let wrapper, plugins, core
  beforeAll(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins

    wrapper = shallowMount(BatchSearchFilterQuery, { global: { plugins } })
  })

  it('display a search bar input', async () => {
    expect(wrapper.find('.batch-search-filter-query').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-filter-query__input').exists()).toBeTruthy()
  })

  it('search button is disabled if search is empty', async () => {
    expect(wrapper.vm.emptySearch).toBe(true)
    expect(wrapper.find('search-bar-input-stub[disablesubmit]').exists()).toBe(true)
    expect(wrapper.find('search-bar-input-stub[disablesubmit]').attributes('disablesubmit')).toBe('true')
    await wrapper.setData({ search: 'test' })
    expect(wrapper.vm.emptySearch).toBe(false)
    expect(wrapper.find('search-bar-input-stub[disablesubmit]').attributes('disablesubmit')).toBe('false')
  })

  describe('data change on search params changed', () => {
    let router, config
    beforeAll(() => {
      config = core.config
      const routes = [
        {
          name: 'task.batch-search.list',
          path: '/batch-search'
        }
      ]
      core.useRouter(routes)
      router = core.router
      plugins = core.plugins
    })
    beforeEach(async ()=> {
      await core.router.replace({ path: '/batch-search', query: {} })
    })
    it('search updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { global: { plugins } })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ search: 'test' })
      await wrapper.vm.filterByQuery()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$route.query.query).toBe('test')
      expect(wrapper.vm.$route.query.page).toBe('1')
    })

    it('field updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { global: { plugins } })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ field: 'name' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.field).toBe('name')
      expect(wrapper.vm.$route.query.page).toBe('1')
    })

    it('field and search updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { global: { plugins } })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ search: 'test', field: 'name' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.field).toBe('name')
      expect(wrapper.vm.$route.query.query).toBe('test')
      expect(wrapper.vm.$route.query.page).toBe('1')
    })
    it('gets query from search params', async () => {
      await router.push({
        name: 'task.batch-search.list',
        query: { query: 'search_from_url' }
      })
      const wrapper = shallowMount(BatchSearchFilterQuery, { global: { plugins } })
      expect(wrapper.vm.search).toBe('search_from_url')
      await wrapper.setData({ search: '' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.query).toBe('')
      expect(wrapper.vm.$route.query.page).toBe('1')
    })

    it('should execute "filterByQuery" on submit one time', async () => {
      await router.push({
        name: 'task.batch-search.list',
        query: { query: 'search_from_url' }
      })
      const wrapper = mount(BatchSearchFilterQuery, { global: { plugins } })

      const searchSpy = vi.spyOn(wrapper.vm, 'filterByQuery')
      expect(searchSpy).not.toBeCalled()

      await wrapper.find('.btn-dark').trigger('submit')

      expect(searchSpy).toBeCalledTimes(1)
    })

    it('should have author field in server mode in fieldOptions', () => {
      config.merge({ mode: 'SERVER' })
      const wrapper = mount(BatchSearchFilterQuery, { global: { plugins } })

      const fields = wrapper.findAll('.search-bar-input-dropdown__option')
      expect(fields).toHaveLength(4)
      const field = wrapper.find('.search-bar-input-dropdown__option:nth-child(4)')
      expect(field.text()).toContain('Author')
    })

    it('should not have author field in local mode in fieldOptions', () => {
      config.merge({ mode: 'LOCAL' })
      const wrapper = mount(BatchSearchFilterQuery, { global: { plugins } })

      const fieldsLOCAL = wrapper.findAll('.search-bar-input-dropdown__option')
      expect(fieldsLOCAL).toHaveLength(3)
      const noAuthorField = wrapper.find('.search-bar-input-dropdown__option:nth-child(4)')
      expect(noAuthorField.exists()).toBeFalsy()
    })
  })
})
