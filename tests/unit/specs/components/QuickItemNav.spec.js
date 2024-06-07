import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import QuickItemNav from '@/components/QuickItemNav'
import { getShortkeyOS } from '@/utils/utils'

vi.mock('@/utils/utils', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    // replace some exports
    getShortkeyOS: vi.fn()
  }
})

describe('QuickItemNav.vue', () => {
  const { plugins } = CoreSetup.init().useAll().useRouter()

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should return the tooltip for mac', () => {
    getShortkeyOS.mockReturnValue('mac')
    const wrapper = shallowMount(QuickItemNav, { global: { plugins } })
    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>⌘</kbd> + <kbd>←</kbd>)')
  })

  it('should return the tooltip for NOT mac', () => {
    getShortkeyOS.mockReturnValue('default')
    const wrapper = shallowMount(QuickItemNav, { global: { plugins } })
    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>ctrl</kbd> + <kbd>←</kbd>)')
  })

  it('should disable the previous button on the first item', () => {
    const props = { index: 0, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeTruthy()
  })

  it('should not disable the previous button on the second item', () => {
    const props = { index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeFalsy()
  })

  it('should disable the next button on the last item', () => {
    const props = { index: 2, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeTruthy()
  })

  it('should not disable the next button on the second item', () => {
    const props = { index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeFalsy()
  })

  it('should enable the previous button explicitely', () => {
    const props = { hasPreviousItem: true }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeFalsy()
  })

  it('should disable the previous button explicitely', () => {
    const props = { hasPreviousItem: false, index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__previous').element.disabled).toBeTruthy()
  })

  it('should enable the next button explicitely', () => {
    const props = { hasNextItem: true }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeFalsy()
  })

  it('should disable the next button explicitely', () => {
    const props = { hasNextItem: false, index: 1, totalItems: 3 }
    const wrapper = shallowMount(QuickItemNav, { global: { plugins }, props })
    expect(wrapper.find('.quick-items-nav__next').element.disabled).toBeTruthy()
  })
})
