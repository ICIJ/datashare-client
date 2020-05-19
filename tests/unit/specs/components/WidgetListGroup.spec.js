import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import WidgetListGroup from '@/components/WidgetListGroup'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('WidgetListGroup.vue', () => {
  beforeEach(() => {
    store.commit('insights/reset')
  })

  it('should be a Vue instance', async () => {
    const widget = { content: '' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should have a `widget--list-group` class', async () => {
    const widget = { content: '' }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.attributes('class')).toContain('widget--list-group')
  })

  it('should contain a title with a `card-header` class', async () => {
    const widget = { title: 'Hello world', card: true }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.find('.widget__header').attributes('class')).toContain('card-header')
  })

  it('should contain a title without `card-header` class', async () => {
    const widget = { title: 'Hello world', card: false }
    const propsData = { widget }
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
    const widget = { title: 'Hello world', card: false, items }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.findAll('.widget__list__item')).toHaveLength(3)
    expect(wrapper.findAll('.widget__list__item').at(0).is('div')).toBeTruthy()
    expect(wrapper.findAll('.widget__list__item').at(1).is('div')).toBeTruthy()
    expect(wrapper.findAll('.widget__list__item').at(2).is('div')).toBeTruthy()
    expect(wrapper.find('.widget__list__item__description').text()).toBe('a short description')
  })

  it('should contain a link', async () => {
    const items = [
      { label: 'foo', href: 'https://www.icij.org' }
    ]
    const widget = { title: 'Hello world', card: false, items }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.findAll('.widget__list__item')).toHaveLength(1)
    expect(wrapper.findAll('.widget__list__item').at(0).is('a')).toBeTruthy()
    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('foo')
    expect(wrapper.findAll('.widget__list__item').at(0).attributes('href')).toBe('https://www.icij.org')
  })

  it('should reverse the list using a pipeline', async () => {
    // Register a pipeline with a unique category
    const pipeline = 'widget-list-group-test-reverse'
    store.commit('pipelines/register', { category: pipeline, type: items => items.reverse() })
    // The list before transformation
    const items = [
      { label: 'foo', href: 'https://www.icij.org' },
      { label: 'bar', href: 'https://www.icij.org' }
    ]
    const widget = { title: 'Hello world', card: false, items, pipeline }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('bar')
    expect(wrapper.findAll('.widget__list__item').at(1).text()).toBe('foo')
  })

  it('should feed the list using a pipeline', async () => {
    // Register a pipeline with a unique category
    const pipeline = 'widget-list-group-test-feed'
    store.commit('pipelines/register', {
      category: pipeline,
      type: items => [{ label: 'foo' }, { label: 'bar' }]
    })
    const widget = { title: 'Hello world', card: false, pipeline }
    const propsData = { widget }
    const wrapper = shallowMount(WidgetListGroup, { localVue, store, propsData })
    await new Promise(resolve => setImmediate(resolve))
    expect(wrapper.findAll('.widget__list__item').at(0).text()).toBe('foo')
    expect(wrapper.findAll('.widget__list__item').at(1).text()).toBe('bar')
  })
})
