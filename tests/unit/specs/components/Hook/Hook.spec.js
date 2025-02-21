import { h, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Hook from '@/components/Hook/Hook'
import { useHooksStore } from '@/store/modules'

// Create a "hooked component" defintion with a render function.
//
// Because we use custom component, the runtime-build function must be defined
// explicitely in the hooked component definition.
function hookedComponentDefinition(content = '') {
  // eslint-disable-next-line vue/one-component-per-file
  return defineComponent({
    render() {
      return h('div', { class: 'hooked-component' }, content)
    }
  })
}

describe('Hook.vue', () => {
  const { config, plugins } = CoreSetup.init().useAll()
  let hooksStore

  beforeEach(() => {
    config.merge({ hooksDebug: false })
    hooksStore = useHooksStore()
    hooksStore.reset()
  })

  it('should be a Vue instance', () => {
    const wrapper = mount(Hook, { global: { plugins } })
    expect(wrapper).toBeTruthy()
  })

  it('should have one component', () => {
    const definition = hookedComponentDefinition()
    hooksStore.register({ target: 'test-hook-one-component', definition })
    const props = { name: 'test-hook-one-component' }
    const wrapper = mount(Hook, { global: { plugins }, props })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(1)
  })

  it('should have two components', () => {
    hooksStore.register({ target: 'test-hook-two-components', definition: hookedComponentDefinition('foo') })
    hooksStore.register({ target: 'test-hook-two-components', definition: hookedComponentDefinition('bar') })
    const props = { name: 'test-hook-two-components' }
    const wrapper = mount(Hook, { global: { plugins }, props })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(2)
  })

  it('should have one components, without the other', () => {
    const definition = hookedComponentDefinition()
    hooksStore.register({ target: 'test-hook-one-component-only', definition })
    hooksStore.register({ target: 'test-foo', definition })
    hooksStore.register({ target: 'test-bar', definition })
    const props = { name: 'test-hook-one-component-only' }
    const wrapper = mount(Hook, { global: { plugins }, props })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(1)
  })

  it('should have two ordered components', () => {
    hooksStore.register({ target: 'test-ordered-components', definition: hookedComponentDefinition('0') })
    hooksStore.register({ target: 'test-ordered-components', definition: hookedComponentDefinition('1') })
    const props = { name: 'test-ordered-components' }
    const wrapper = mount(Hook, { global: { plugins }, props })
    expect(wrapper.findAll('.hooked-component').at(0).text()).toBe('0')
    expect(wrapper.findAll('.hooked-component').at(1).text()).toBe('1')
  })

  it('should have two components in reverse order', () => {
    const target = 'test-ordered-components'
    hooksStore.register({ target, definition: hookedComponentDefinition('0'), order: 1 })
    hooksStore.register({ target, definition: hookedComponentDefinition('1') })
    const props = { name: target, xClass: 'hooked-component' }
    const wrapper = mount(Hook, { global: { plugins }, props })
    expect(wrapper.findAll('.hooked-component')).toHaveLength(2)
    expect(wrapper.findAll('.hooked-component').at(0).text()).toBe('1')
    expect(wrapper.findAll('.hooked-component').at(1).text()).toBe('0')
  })

  it('should not be in debug mode', () => {
    const wrapper = mount(Hook, { global: { plugins } })
    expect(wrapper.findAll('.hook-debug')).toHaveLength(0)
  })

  it('should be in debug mode', () => {
    config.merge({ hooksDebug: true })
    const wrapper = mount(Hook, { global: { plugins } })
    expect(wrapper.findAll('.hook-debug')).toHaveLength(1)
  })
})
