import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'
import Pagination from '@/components/Pagination'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import messages from '@/lang/en'
import router from '@/router'
import cloneDeep from 'lodash/cloneDeep'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('Pagination.vue', () => {
  let wrapper
  const template = { name: 'router-name', query: { from: 0, size: 10 } }

  beforeEach(() => {
    wrapper = shallowMount(Pagination, { localVue, i18n, router, propsData: { total: 22, getToTemplate: () => cloneDeep(template) }, mock: { $t: msg => msg } })
  })

  describe('should display the pagination, or not', () => {
    it('should display the pagination', () => {
      wrapper.setProps({ total: 22, isDisplayed: () => true, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeTruthy()
    })

    it('should not display the pagination', () => {
      wrapper.setProps({ total: 22, isDisplayed: () => false, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeFalsy()
    })

    it('should display the pagination by default if enough results', () => {
      expect(wrapper.find('.pagination').exists()).toBeTruthy()
    })

    it('should not display the pagination by default if not enough results', () => {
      wrapper.setProps({ total: 5, getToTemplate: () => template })

      expect(wrapper.find('.pagination').exists()).toBeFalsy()
    })
  })

  describe('should set some links as unavailable', () => {
    it('should display the first and the previous page as unavailable', () => {
      const template = { name: 'router-name', query: { from: 0, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

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
    it('should generate the link to the first page', async () => {
      const template = { name: 'router-name', query: { from: 20, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.firstPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 0, size: 10 } })
    })

    it('should generate the link to the previous page', async () => {
      const template = { name: 'router-name', query: { from: 20, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.previousPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 10, size: 10 } })
    })

    it('should generate the link to the next page', async () => {
      const template = { name: 'router-name', query: { from: 10, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.nextPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 20, size: 10 } })
    })

    it('should generate the link to the last page', async () => {
      const template = { name: 'router-name', query: { from: 10, size: 10 } }
      wrapper.setProps({ total: 22, getToTemplate: () => cloneDeep(template) })

      expect(wrapper.vm.lastPageLinkParameters()).toMatchObject({ name: 'router-name', query: { from: 20, size: 10 } })
    })
  })
})
