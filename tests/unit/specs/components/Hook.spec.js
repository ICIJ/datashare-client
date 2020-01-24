import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import { App } from '@/main'
import Hook from '@/components/Hook'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('Hook.vue', () => {
  beforeEach(() => {
    Murmur.config.merge({ hooksDebug: false })
    store.commit('hooks/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(Hook, { localVue, store })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should have one component', () => {
    store.commit('hooks/register', { target: 'test-hook-one-component' })
    const propsData = { name: 'test-hook-one-component' }
    const wrapper = shallowMount(Hook, { localVue, store, propsData })
    expect(wrapper.findAll('.hook > *')).toHaveLength(1)
  })

  it('should have two components', () => {
    store.commit('hooks/register', { target: 'test-hook-two-components' })
    store.commit('hooks/register', { target: 'test-hook-two-components' })
    const propsData = { name: 'test-hook-two-components' }
    const wrapper = shallowMount(Hook, { localVue, store, propsData })
    expect(wrapper.findAll('.hook > *')).toHaveLength(2)
  })

  it('should have one components, without the other', () => {
    store.commit('hooks/register', { target: 'test-hook-one-component-only' })
    store.commit('hooks/register', { target: 'test-foo' })
    store.commit('hooks/register', { target: 'test-bar' })
    const propsData = { name: 'test-hook-one-component-only' }
    const wrapper = shallowMount(Hook, { localVue, store, propsData })
    expect(wrapper.findAll('.hook > *')).toHaveLength(1)
  })

  it('should have two ordered components', () => {
    store.commit('hooks/register', { target: 'test-ordered-components', definition: '0' })
    store.commit('hooks/register', { target: 'test-ordered-components', definition: '1' })
    const propsData = { name: 'test-ordered-components' }
    const wrapper = shallowMount(Hook, { localVue, store, propsData })
    expect(wrapper.vm.hookedComponents[0].definition).toBe('0')
    expect(wrapper.vm.hookedComponents[1].definition).toBe('1')
  })

  it('should have two components in reverse order', () => {
    store.commit('hooks/register', { target: 'test-ordered-components', definition: '0', order: 1 })
    store.commit('hooks/register', { target: 'test-ordered-components', definition: '1' })
    const propsData = { name: 'test-ordered-components' }
    const wrapper = shallowMount(Hook, { localVue, store, propsData })
    expect(wrapper.vm.hookedComponents[0].definition).toBe('1')
    expect(wrapper.vm.hookedComponents[1].definition).toBe('0')
  })

  it('should not be in debug mode', () => {
    const wrapper = shallowMount(Hook, { localVue, store })
    expect(wrapper.classes('hook--debug')).toBeFalsy()
  })

  it('should be in debug mode', () => {
    Murmur.config.merge({ hooksDebug: true })
    const wrapper = shallowMount(Hook, { localVue, store })
    expect(wrapper.classes('hook--debug')).toBeTruthy()
  })
})
