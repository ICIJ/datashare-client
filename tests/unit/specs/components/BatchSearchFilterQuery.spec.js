import { createLocalVue, shallowMount, mount } from '@vue/test-utils'

import BatchSearchFilterQuery from '@/components/BatchSearchFilterQuery'
import { Core } from '@/core'
import VueRouter from 'vue-router'

describe('BatchSearchFilterQuery.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  it('display a search bar input', async () => {
    wrapper = shallowMount(BatchSearchFilterQuery, { i18n })
    expect(wrapper.find('.batch-search-filter-query').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-filter-query__input').exists()).toBeTruthy()
  })

  describe('data change on search params changed', () => {
    let router = null
    beforeEach(() => {
      router = new VueRouter({
        routes: [{
          name: 'batch-search', path: 'batch-search'
        }]
      })
    })

    it('search updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery,
        { i18n, localVue, router })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ search: 'test' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.query).toBe('test')
      expect(wrapper.vm.$route.query.page).toBe(1)
    })

    it('gets query from search params', async () => {
      await router.push({
        name: 'batch-search',
        query: { query: 'search_from_url' }
      })
      const wrapper = shallowMount(BatchSearchFilterQuery, { i18n, localVue, router })
      expect(wrapper.vm.search).toBe('search_from_url')
      await wrapper.setData({ search: '' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.query).toBe('')
      expect(wrapper.vm.$route.query.page).toBe(1)
    })

    it('should execute "filterByQuery" on submit one time', async () => {
      await router.push({
        name: 'batch-search',
        query: { query: 'search_from_url' }
      })
      const wrapper = mount(BatchSearchFilterQuery, { i18n, localVue, router })

      const searchSpy = jest.spyOn(wrapper.vm, 'filterByQuery')
      expect(searchSpy).not.toBeCalled()

      await wrapper.find('.btn-dark').trigger('submit')

      expect(searchSpy).toBeCalledTimes(1)
    })
  })
})
