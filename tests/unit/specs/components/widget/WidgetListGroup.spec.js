import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetListGroup from '@/components/widget/WidgetListGroup'
import { Core } from '@/core'

describe('WidgetListGroup.vue', () => {
  const { localVue, store } = Core.init(createLocalVue()).useAll()

  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', async () => {
    const propsData = { widget: { content: '' } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper).toBeTruthy()
  })

  it('should have a `widget--list-group` class', async () => {
    const propsData = { widget: { content: '' } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.attributes('class')).toContain('widget--list-group')
  })

  it('should contain a title with a `card-header` class', async () => {
    const propsData = { widget: { title: 'Hello world', card: true } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.find('.widget__header').attributes('class')).toContain('card-header')
  })

  it('should contain a title without `card-header` class', async () => {
    const propsData = { widget: { title: 'Hello world', card: false } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.find('.widget__header').attributes('class')).not.toContain('card-header')
  })

  it('should contain a 3 items', async () => {
    const items = [
      { label: 'foo' },
      { label: 'bar' },
      { label: 'buz', description: 'a short description' }
    ]
    const propsData = { widget: { title: 'Hello world', card: false, items } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.findAll('.widget__list__item')).toHaveLength(3)
    expect(wrapper.findAll('.widget__list__item').at(0).element.tagName).toBe('DIV')
    expect(wrapper.findAll('.widget__list__item').at(1).element.tagName).toBe('DIV')
    expect(wrapper.findAll('.widget__list__item').at(2).element.tagName).toBe('DIV')
    expect(wrapper.find('.widget__list__item__description').text()).toBe('a short description')
  })

  it('should contain a link', async () => {
    const items = [
      { label: 'foo', href: 'https://www.icij.org' }
    ]
    const propsData = { widget: { title: 'Hello world', card: false, items } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.findAll('.widget__list__item')).toHaveLength(1)
    expect(wrapper.findAll('.widget__list__item').at(0).element.tagName).toBe('A')
    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('foo')
    expect(wrapper.findAll('.widget__list__item').at(0).attributes('href')).toBe('https://www.icij.org')
  })

  it('should reverse the list using a pipeline', async () => {
    const pipeline = 'widget-list-group-test-reverse'
    store.commit('pipelines/register', { category: pipeline, type: items => items.reverse() })
    const items = [
      { label: 'foo', href: 'https://www.icij.org' },
      { label: 'bar', href: 'https://www.icij.org' }
    ]
    const propsData = { widget: { title: 'Hello world', card: false, items, pipeline } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('bar')
    expect(wrapper.findAll('.widget__list__item').at(1).text()).toBe('foo')
  })

  it('should feed the list using a pipeline', async () => {
    const pipeline = 'widget-list-group-test-feed'
    store.commit('pipelines/register', {
      category: pipeline,
      type: () => [{ label: 'foo' }, { label: 'bar' }]
    })
    const propsData = { widget: { title: 'Hello world', card: false, pipeline } }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))

    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('foo')
    expect(wrapper.findAll('.widget__list__item').at(1).text()).toBe('bar')
  })
})
