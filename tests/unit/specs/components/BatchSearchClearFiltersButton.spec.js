import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import BatchSearchClearFilters from '@/components/BatchSearchClearFilters'
import { Core } from '@/core'

describe('BatchSearchClearFilters.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  let router = null
  beforeEach(() => {
    router = new VueRouter({
      routes: [
        {
          name: 'batch-search',
          path: 'batch-search'
        }
      ]
    })
  })

  it('display clear filter button', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router })
    expect(wrapper.find('.batch-search-clear-filters').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-clear-filters').text()).toBe('Clear filters')
  })

  it('should enable clear filter button when a filter is selected', async () => {
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router })

    const button = wrapper.find('.batch-search-clear-filters')
    expect(button.attributes().disabled).toBeTruthy()
    await router.push({
      name: 'batch-search',
      query: { page: 1, query: 'hello' }
    })
    const buttonEnabled = wrapper.find('.batch-search-clear-filters')
    expect(buttonEnabled.attributes().disabled).toBeFalsy()
  })

  it('trigger clear filters button', async () => {
    await router.push({
      name: 'batch-search',
      query: { page: 1, query: 'hello' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router })
    expect(wrapper.vm.$route.query).toEqual({ page: '1', query: 'hello' })
    wrapper.find('.batch-search-clear-filters').trigger('click')
    expect(wrapper.vm.$route.query).toEqual({})
  })

  it('is active only on batch search filters', async () => {
    await router.push({
      name: 'batch-search',
      query: { test: 'test' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router })
    expect(wrapper.vm.$route.query).toEqual({ test: 'test' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
    await router.push({
      name: 'batch-search',
      query: { query: 'hello' }
    })
    expect(wrapper.vm.$route.query).toEqual({ query: 'hello' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
  it('is not active with server batch search filters', async () => {
    await router.push({
      name: 'batch-search',
      query: { publishState: 'publishState' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    await router.push({
      name: 'batch-search',
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(false)
  })
  it('is active with server batch search filters', async () => {
    const computed = { isServer: () => true }
    await router.push({
      name: 'batch-search',
      query: { publishState: 'publishState' }
    })
    wrapper = shallowMount(BatchSearchClearFilters, { i18n, localVue, router, computed })
    expect(wrapper.vm.$route.query).toEqual({ publishState: 'publishState' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)

    await router.push({
      name: 'batch-search',
      query: { project: 'project' }
    })
    expect(wrapper.vm.$route.query).toEqual({ project: 'project' })
    expect(wrapper.vm.hasActiveFilter).toBe(true)
  })
})
