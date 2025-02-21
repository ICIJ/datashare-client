import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetText from '@/components/Widget/WidgetText'

describe('WidgetText.vue', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('should be a Vue instance', () => {
    const widget = { content: '' }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    expect(wrapper).toBeTruthy()
  })

  it('should have a `widget--text` class', () => {
    const widget = { content: '' }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    expect(wrapper.attributes('class')).toContain('widget--text')
  })

  it('should only contain "hello world"', async () => {
    const widget = { content: 'Hello world' }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    await flushPromises()
    expect(wrapper.find('.widget__content').text()).toBe('Hello world')
  })

  it('should contain a title "hello world"', () => {
    const widget = { title: 'Hello world' }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    expect(wrapper.find('.widget__header').text()).toBe('Hello world')
  })

  it('should contain a title with a `card-body` class', () => {
    const widget = { title: 'Hello world', card: true }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    expect(wrapper.find('.widget__header').attributes('class')).toContain('card-body')
  })

  it('should contain a title without `card-body` class', () => {
    const widget = { title: 'Hello world', card: false }
    const props = { widget }
    const wrapper = shallowMount(WidgetText, { global: { plugins }, props })
    expect(wrapper.find('.widget__header').attributes('class')).not.toContain('card-body')
  })
})
