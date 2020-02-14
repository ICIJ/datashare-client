import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import WidgetText from '@/components/WidgetText'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('WidgetText.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetText, { localVue, store })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should contain nothing but the void', () => {
    const wrapper = shallowMount(WidgetText, { localVue, store })
    expect(wrapper.text()).toBe('')
  })

  it('should have a `widget--text` class', () => {
    const wrapper = shallowMount(WidgetText, { localVue, store })
    expect(wrapper.attributes('class')).toContain('widget--text')
  })

  it('should only contain "hello world"', () => {
    const propsData = { content: 'hello world' }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    expect(wrapper.text()).toBe('Hello world')
    expect(wrapper.find('.widget__content').text()).toBe('Hello world')
  })

  it('should contain a title "hello world"', () => {
    const propsData = { title: 'hello world' }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    expect(wrapper.find('.widget__header').text()).toBe('Hello world')
  })

  it('should contain a title with a `card-header` class', () => {
    const propsData = { title: 'hello world', card: true }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    expect(wrapper.find('.widget__header').attributes('class')).toContain('card-header')
  })

  it('should contain a title without `card-header` class', () => {
    const propsData = { title: 'hello world', card: false }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    expect(wrapper.find('.widget__header').attributes('class')).not.toContain('card-header')
  })
})
