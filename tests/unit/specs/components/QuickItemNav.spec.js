import { createLocalVue, shallowMount } from '@vue/test-utils'

import QuickItemNav from '@/components/QuickItemNav'
import { Core } from '@/core'
import { getShortkeyOS } from '@/utils/utils'

jest.mock('@/utils/utils')

describe('QuickItemNav.vue', () => {
  const { i18n, localVue, store, router } = Core.init(createLocalVue()).useAll()

  afterAll(() => {
    jest.unmock('@/utils/utils')
  })

  it('should return the tooltip for mac', () => {
    getShortkeyOS.mockReturnValue('mac')
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router })
    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>⌘</kbd> + <kbd>←</kbd>)')
  })

  it('should return the tooltip for NOT mac', () => {
    getShortkeyOS.mockReturnValue('default')
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router })
    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>ctrl</kbd> + <kbd>←</kbd>)')
  })

  it('should disable the previous button on the first item', () => {
    const propsData = { index: 0, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeTruthy()
  })

  it('should not disable the previous button on the second item', () => {
    const propsData = { index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeFalsy()
  })

  it('should disable the next button on the last item', () => {
    const propsData = { index: 2, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeTruthy()
  })

  it('should not disable the next button on the second item', () => {
    const propsData = { index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeFalsy()
  })

  it('should enable the previous button explicitely', () => {
    const propsData = { hasPreviousItem: true }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeFalsy()
  })

  it('should disable the previous button explicitely', () => {
    const propsData = { hasPreviousItem: false, index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeTruthy()
  })

  it('should enable the next button explicitely', () => {
    const propsData = { hasNextItem: true }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeFalsy()
  })

  it('should disable the next button explicitely', () => {
    const propsData = { hasNextItem: false, index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { i18n, localVue, store, router, propsData })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeTruthy()
  })
})
