import { flushPromises, shallowMount } from '@vue/test-utils'

import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import CoreSetup from '~tests/unit/CoreSetup'

describe('BatchSearchClearFilters.vue', () => {
  const routeName = 'task.batch-search.list';
  const routes = [
    {
      name: routeName,
      path: '/batch-search'
    }
  ]
  const core = CoreSetup.init().useAll().useRouter(routes)
  const plugins = core.plugins
  const router = core.router
  let wrapper = null
  const props = { routeName, localSearchParams: { publishState: true, project: true, query: true } }

  it('display clear filter button', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.find('.batch-search-clear-filters').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-clear-filters').text()).toBe('Clear filters')
  })

  it('should enable clear filter button when a filter is selected', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { global: { plugins, renderStubDefaultSlot: true }, props })

    const button = wrapper.find('.batch-search-clear-filters')
    expect(button.attributes().disabled).toBeTruthy()
    await router.push({
      name: routeName,
      query: { page: 1, query: 'hello' }
    })
    const buttonEnabled = wrapper.find('.batch-search-clear-filters')
    expect(buttonEnabled.attributes().disabled).toBe('false')
  })

  it('trigger clear filters button', async () => {
    await router.push({
      name: routeName,
      query: { page: 1, query: 'hello' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { global: { plugins }, props })
    expect(wrapper.vm.$route.query).toEqual({ page: '1', query: 'hello' })
    await wrapper.find('.batch-search-clear-filters').trigger('click')
    await flushPromises()
    expect(wrapper.vm.$route.query).toEqual({})
  })

  it('is active only on batch search filters', async () => {
    await router.push({
      name: routeName,
      query: { test: 'test' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { global: { plugins }, props })
    expect(wrapper.vm.$route.query).toEqual({ test: 'test' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
    await router.push({
      name: routeName,
      query: { query: 'hello' }
    })
    expect(wrapper.vm.$route.query).toEqual({ query: 'hello' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
  it('is not active when not listed in local search params', async () => {
    await router.push({
      name: routeName,
      query: { publishState: 'publishState' }
    })
    const props = { routeName: 'batch-search', localSearchParams: { publishState: false } }

    wrapper = shallowMount(BatchSearchClearFilters, { global: { plugins }, props })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    await router.push({
      name: routeName,
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
  })
  it('is active with server batch search filters', async () => {
    core.config.set('mode', 'SERVER')
    await router.push({
      name: routeName,
      query: { publishState: 'publishState' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, {
      global: { plugins, renderStubDefaultSlot: true },
      props
    })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)

    await router.push({
      name: routeName,
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
})
