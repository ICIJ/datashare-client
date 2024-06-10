import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetEmpty from '@/components/widget/WidgetEmpty'

describe('WidgetEmpty.vue', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    core.store.commit('insights/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetEmpty, { global: { plugins } })
    expect(wrapper).toBeTruthy()
  })

  it('should contain nothing but the void', () => {
    const wrapper = shallowMount(WidgetEmpty, { global: { plugins } })
    expect(wrapper.text()).toBe('')
  })

  it('should have a `widget--empty` class', () => {
    const wrapper = shallowMount(WidgetEmpty, { global: { plugins } })
    expect(wrapper.attributes('class')).toContain('widget--empty')
  })
})
