import { setActivePinia, createPinia } from 'pinia'

import { useHooksStore } from '@/store/modules'
import { HookedComponent } from '@/store/hooks'

describe('HooksStore', () => {
  let hooksStore

  beforeEach(() => {
    setActivePinia(createPinia())
    hooksStore = useHooksStore()
  })

  it('should register hooked components', () => {
    hooksStore.register({ target: 'foo' })
    hooksStore.register({ target: 'bar' })
    expect(hooksStore.registered).toHaveLength(2)
    hooksStore.register({ target: 'baz' })
    expect(hooksStore.registered).toHaveLength(3)
  })

  it('should register a hooked component', () => {
    hooksStore.register({ target: 'foo' })
    expect(hooksStore.components).toHaveLength(1)
    expect(hooksStore.components[0] instanceof HookedComponent).toBeTruthy()
  })

  it('should find a hooked component by its target name', () => {
    hooksStore.register({ target: 'foo' })
    hooksStore.register({ target: 'bar' })
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
  })

  it('should find several hooked components by their target name', () => {
    hooksStore.register({ target: 'foo' })
    hooksStore.register({ target: 'bar' })
    hooksStore.register({ target: 'baz' })
    hooksStore.register({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', () => {
    hooksStore.register({ target: 'foo' })
    hooksStore.register({ target: 'baz' })
    hooksStore.register({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
    hooksStore.resetTarget('baz')
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
  })
})
