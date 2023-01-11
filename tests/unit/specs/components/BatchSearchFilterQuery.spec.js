import { createLocalVue, shallowMount, mount } from '@vue/test-utils'

import BatchSearchFilterQuery from '@/components/BatchSearchFilterQuery'
import { Core } from '@/core'
import VueRouter from 'vue-router'
import Murmur from '@icij/murmur'

describe('BatchSearchFilterQuery.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  it('display a search bar input', async () => {
    wrapper = shallowMount(BatchSearchFilterQuery, { i18n })
    expect(wrapper.find('.batch-search-filter-query').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-filter-query__input').exists()).toBeTruthy()
  })

  it('search button is disabled if search is empty', async () => {
    wrapper = shallowMount(BatchSearchFilterQuery, { i18n })
    expect(wrapper.vm.emptySearch).toBe(true)
    expect(wrapper.find('search-bar-input-stub[disablesubmit]').exists()).toBe(true)
    await wrapper.setData({ search: 'test' })
    expect(wrapper.vm.emptySearch).toBe(false)
    expect(wrapper.find('search-bar-input-stub[disablesubmit]').exists()).toBe(false)
  })

  describe('data change on search params changed', () => {
    let router = null
    beforeEach(() => {
      router = new VueRouter({
        routes: [
          {
            name: 'batch-search',
            path: 'batch-search'
          }
        ],
        mode: 'abstract'
      })
    })

    it('search updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { i18n, localVue, router })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ search: 'test' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.query).toBe('test')
      expect(wrapper.vm.$route.query.page).toBe(1)
    })

    it('field updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { i18n, localVue, router })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ field: 'name' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.field).toBe('name')
      expect(wrapper.vm.$route.query.page).toBe(1)
    })

    it('field and search updated on filterByQuery', async () => {
      const wrapper = shallowMount(BatchSearchFilterQuery, { i18n, localVue, router })
      expect(wrapper.vm.search).toBe('')
      await wrapper.setData({ search: 'test', field: 'name' })
      await wrapper.vm.filterByQuery()
      expect(wrapper.vm.$route.query.field).toBe('name')
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

    it('should have author field in server mode in fieldOptions', () => {
      Murmur.config.merge({ mode: 'SERVER' })
      const wrapper = mount(BatchSearchFilterQuery, { i18n, localVue })

      const fields = wrapper.findAll('.search-bar-input-fields__option')
      expect(fields).toHaveLength(4)
      const field = wrapper.find('.search-bar-input-fields__option:nth-child(4)')
      expect(field.text()).toContain('Author')
    })

    it('should not have author field in local mode in fieldOptions', () => {
      Murmur.config.merge({ mode: 'LOCAL' })
      const wrapper = mount(BatchSearchFilterQuery, { i18n, localVue })

      const fieldsLOCAL = wrapper.findAll('.search-bar-input-fields__option')
      expect(fieldsLOCAL).toHaveLength(3)
      const noAuthorField = wrapper.find('.search-bar-input-fields__option:nth-child(4)')
      expect(noAuthorField.exists()).toBeFalsy()
    })
  })
})
