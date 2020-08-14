import cloneDeep from 'lodash/cloneDeep'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Pagination from '@/components/Pagination'
import { Core } from '@/core'

describe('Pagination.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  const template = { name: 'router-name', query: { from: 0, size: 10 } }

  beforeEach(() => {
    wrapper = shallowMount(Pagination, { i18n, localVue, propsData: { total: 22, getToTemplate: () => cloneDeep(template) }, sync: false })
  })

  describe('should display the pagination, or not', () => {
    it('should display the pagination', () => {
      wrapper.setProps({ total: 22, isDisplayed: () => true, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeTruthy()
    })

    it('should not display the pagination', async () => {
      await wrapper.setProps({ total: 22, isDisplayed: () => false, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeFalsy()
    })

    it('should display the pagination by default if enough results', () => {
      expect(wrapper.find('.pagination').exists()).toBeTruthy()
    })

    it('should not display the pagination by default if not enough results', async () => {
      await wrapper.setProps({ total: 5, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeFalsy()
    })
  })

  describe('should set some links as unavailable', () => {
    it('should display the first and the previous page as unavailable', async () => {
      const template = { name: 'router-name', query: { from: 0, size: 10 } }
      await wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.findAll('.pagination__first-page.disabled')).toHaveLength(1)
      expect(wrapper.findAll('.pagination__previous-page.disabled')).toHaveLength(1)
      expect(wrapper.findAll('.pagination__next-page.disabled')).toHaveLength(0)
      expect(wrapper.findAll('.pagination__last-page.disabled')).toHaveLength(0)
    })

    it('should display the next and the last page as unavailable', async () => {
      const template = { name: 'router-name', query: { from: 20, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.findAll('.pagination__first-page.disabled')).toHaveLength(0)
      expect(wrapper.findAll('.pagination__previous-page.disabled')).toHaveLength(0)
      expect(wrapper.findAll('.pagination__next-page.disabled')).toHaveLength(1)
      expect(wrapper.findAll('.pagination__last-page.disabled')).toHaveLength(1)
    })
  })

  describe('should generate links to pages', () => {
    it('should generate the link to the first page', () => {
      const template = { name: 'router-name', query: { from: 20, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.firstPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 0, size: 10 } })
    })

    it('should generate the link to the previous page', () => {
      const template = { name: 'router-name', query: { from: 20, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.previousPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 10, size: 10 } })
    })

    it('should generate the link to the next page', () => {
      const template = { name: 'router-name', query: { from: 10, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.nextPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 20, size: 10 } })
    })

    it('should generate the link to the last page', () => {
      const template = { name: 'router-name', query: { from: 10, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.lastPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 20, size: 10 } })
    })
  })
})
