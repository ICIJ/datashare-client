import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import { Core } from '@/core'

describe('BatchSearchClearFilters.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  let router = null
  const propsData = { routeName: 'batch-search', localSearchParams: { publishState: true, project: true, query: true } }
  beforeEach(() => {
    router = new VueRouter({
      routes: [
        {
          name: 'batch-search-list',
          path: 'batch-search'
        }
      ]
    })
  })

  it('display clear filter button', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, propsData })
    expect(wrapper.find('.batch-search-clear-filters').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-clear-filters').text()).toBe('Clear filters')
  })

  it('should enable clear filter button when a filter is selected', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, propsData })

    const button = wrapper.find('.batch-search-clear-filters')
    expect(button.attributes().disabled).toBeTruthy()
    await router.push({
      name: 'batch-search-list',
      query: { page: 1, query: 'hello' }
    })
    const buttonEnabled = wrapper.find('.batch-search-clear-filters')
    expect(buttonEnabled.attributes().disabled).toBeFalsy()
  })

  it('trigger clear filters button', async () => {
    await router.push({
      name: 'batch-search-list',
      query: { page: 1, query: 'hello' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, propsData })
    expect(wrapper.vm.$route.query).toEqual({ page: '1', query: 'hello' })
    wrapper.find('.batch-search-clear-filters').trigger('click')
    expect(wrapper.vm.$route.query).toEqual({})
  })

  it('is active only on batch search filters', async () => {
    await router.push({
      name: 'batch-search-list',
      query: { test: 'test' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, propsData })
    expect(wrapper.vm.$route.query).toEqual({ test: 'test' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
    await router.push({
      name: 'batch-search-list',
      query: { query: 'hello' }
    })
    expect(wrapper.vm.$route.query).toEqual({ query: 'hello' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
  it('is not active when not listed in local search params', async () => {
    await router.push({
      name: 'batch-search-list',
      query: { publishState: 'publishState' }
    })
    const propsData = { routeName: 'batch-search', localSearchParams: { publishState: false } }

    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, propsData })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    await router.push({
      name: 'batch-search-list',
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
  })
  it('is active with server batch search filters', async () => {
    const computed = { isServer: () => true }
    await router.push({
      name: 'batch-search-list',
      query: { publishState: 'publishState' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, computed, propsData })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)

    await router.push({
      name: 'batch-search-list',
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
})
