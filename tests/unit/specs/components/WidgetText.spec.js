import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetText from '@/components/WidgetText'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('WidgetText.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', async () => {
    const widget = { content: '' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should have a `widget--text` class', async () => {
    const widget = { content: '' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.attributes('class')).toContain('widget--text')
  })

  it('should only contain "hello world"', async () => {
    const widget = { content: 'Hello world' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.find('.widget__content').text()).toBe('Hello world')
  })

  it('should contain a title "hello world"', async () => {
    const widget = { title: 'Hello world' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.find('.widget__header').text()).toBe('Hello world')
  })

  it('should contain a title with a `card-header` class', async () => {
    const widget = { title: 'Hello world', card: true }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.find('.widget__header').attributes('class')).toContain('card-header')
  })

  it('should contain a title without `card-header` class', async () => {
    const widget = { title: 'Hello world', card: false }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetText, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.find('.widget__header').attributes('class')).not.toContain('card-header')
  })
})
