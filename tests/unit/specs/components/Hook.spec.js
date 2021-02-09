import { createLocalVue, mount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import { Core } from '@/core'
import Hook from '@/components/Hook'

const { localVue, store } = Core.init(createLocalVue()).useAll()

// Functional component (such as Hook) must be wrapped inside a non-functional
// component to be tested with Vue Test Utils.
//
// @see https://stevenklambert.com/writing/unit-testing-vuejs-functional-component-multiple-root-nodes/
const WrappedHook = {
  components: { Hook },
  template: `
    <div>
      <hook v-bind="$attrs" v-on="$listeners" ref="hook" />
    </div>
  `
}

// Create a "hooked component" defintion with a render function.
//
// Because we use custom component, the runtime-build function must be defined
// explicitely in the hooked component definition.
function hookedComponentDefinition (content = '') {
  return {
    render (h) {
      return h('div', { class: 'hooked-component' }, content)
    }
  }
}

describe('Hook.vue', () => {
  beforeEach(() => {
    Murmur.config.merge({ hooksDebug: false })
    store.commit('hooks/reset')
  })

  it('should be a Vue instance', () => {
    const wrapper = mount(WrappedHook, { localVue, store })
    expect(wrapper).toBeTruthy()
  })

  it('should have one component', () => {
    const definition = hookedComponentDefinition()
    store.commit('hooks/register', { target: 'test-hook-one-component', definition })
    const propsData = { name: 'test-hook-one-component' }
    const wrapper = mount(WrappedHook, { localVue, store, propsData })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(1)
  })

  it('should have two components', () => {
    store.commit('hooks/register', { target: 'test-hook-two-components', definition: hookedComponentDefinition('foo') })
    store.commit('hooks/register', { target: 'test-hook-two-components', definition: hookedComponentDefinition('bar') })
    const propsData = { name: 'test-hook-two-components' }
    const wrapper = mount(WrappedHook, { localVue, store, propsData })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(2)
  })

  it('should have one components, without the other', () => {
    const definition = hookedComponentDefinition()
    store.commit('hooks/register', { target: 'test-hook-one-component-only', definition })
    store.commit('hooks/register', { target: 'test-foo', definition })
    store.commit('hooks/register', { target: 'test-bar', definition })
    const propsData = { name: 'test-hook-one-component-only' }
    const wrapper = mount(WrappedHook, { localVue, store, propsData })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(1)
  })

  it('should have two ordered components', () => {
    store.commit('hooks/register', { target: 'test-ordered-components', definition: hookedComponentDefinition('0') })
    store.commit('hooks/register', { target: 'test-ordered-components', definition: hookedComponentDefinition('1') })
    const propsData = { name: 'test-ordered-components' }
    const wrapper = mount(WrappedHook, { localVue, store, propsData })
    expect(wrapper.findAll('.hooked-component').at(0).text()).toBe('0')
    expect(wrapper.findAll('.hooked-component').at(1).text()).toBe('1')
  })

  it('should have two components in reverse order', () => {
    store.commit('hooks/register', { target: 'test-ordered-components', definition: hookedComponentDefinition('0'), order: 1 })
    store.commit('hooks/register', { target: 'test-ordered-components', definition: hookedComponentDefinition('1') })
    const propsData = { name: 'test-ordered-components' }
    const wrapper = mount(WrappedHook, { localVue, store, propsData })
    expect(wrapper.findAll('.hooked-component').at(0).text()).toBe('1')
    expect(wrapper.findAll('.hooked-component').at(1).text()).toBe('0')
  })

  it('should not be in debug mode', () => {
    const wrapper = mount(WrappedHook, { localVue, store })
    expect(wrapper.findAll('.hook-debug')).toHaveLength(0)
  })

  it('should be in debug mode', () => {
    Murmur.config.merge({ hooksDebug: true })
    const wrapper = mount(WrappedHook, { localVue, store })
    expect(wrapper.findAll('.hook-debug')).toHaveLength(1)
  })
})
