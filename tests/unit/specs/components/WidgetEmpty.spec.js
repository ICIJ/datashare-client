import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import WidgetEmpty from '@/components/WidgetEmpty'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('WidgetEmpty.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetEmpty, { localVue, store })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should contain nothing but the void', () => {
    const wrapper = shallowMount(WidgetEmpty, { localVue, store })
    expect(wrapper.text()).toBe('')
  })

  it('should have a `widget--empty` class', () => {
    const wrapper = shallowMount(WidgetEmpty, { localVue, store })
    expect(wrapper.attributes('class')).toContain('widget--empty')
  })
})
