import { setActivePinia, getActivePinia, createPinia, mapStores, mapState } from 'pinia'
import { flushPromises, shallowMount } from '@vue/test-utils'

import { defineSuffixedStore } from '@/store/defineSuffixedStore'

describe('store/defineSuffixedStore', () => {
  let store, useFooStore

  beforeEach(() => {
    setActivePinia(createPinia())
    // Create a sample store "foo" with a suffix.
    // For the sake of simplicity, we use the options API of Pina.
    useFooStore = defineSuffixedStore('foo', {
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        }
      }
    })
    // Finally, create the store instance to be shared between tests (without suffix).
    store = useFooStore()
  })

  it('should return the same store', () => {
    const sameStore = useFooStore()
    expect(sameStore).toBe(store)
  })

  it('should create a store with a default id', () => {
    expect(store.$id).toBe('foo')
  })

  it('should return the same store when `instantiate` has no params', () => {
    const sameStore = useFooStore.create()
    expect(sameStore).toBe(store)
  })

  it('should return the same store when `withSuffix` has no params', () => {
    const useStore = useFooStore.withSuffix()
    const sameStore = useStore()
    expect(sameStore).toBe(store)
  })

  it('should create a store with a defined id', () => {
    const anotherStore = useFooStore.create('bar')
    expect(anotherStore.$id).toBeDefined()
  })

  it('should create a store with a different id than the default search store', () => {
    const anotherStore = useFooStore.create('bar')
    expect(anotherStore.$id).not.toBe('foo')
  })

  it('should create a store with a different state', () => {
    const anotherStore = useFooStore.create('bar')
    expect(anotherStore.count).toBe(0)
    expect(store.count).toBe(0)
    anotherStore.increment()
    expect(anotherStore.count).toBe(1)
    expect(store.count).toBe(0)
    anotherStore.increment()
    expect(anotherStore.count).toBe(2)
    expect(store.count).toBe(0)
  })

  it('should create twice the same store with an id different than the default search store', () => {
    const barStore = useFooStore.create('bar')
    const barStoreAgain = useFooStore.create('bar')
    expect(barStore).not.toBe(store)
    expect(barStore.$id).not.toBe(store.$id)
    expect(barStore).toBe(barStoreAgain)
    expect(barStore.$id).toBe(barStoreAgain.$id)
  })

  it('should create twice the same store with an id different than the default search store and share the state', () => {
    const barStore = useFooStore.create('bar')
    const barStoreAgain = useFooStore.create('bar')

    expect(barStore.count).toBe(0)
    expect(barStoreAgain.count).toBe(0)
    barStore.increment()
    expect(barStore.count).toBe(1)
    expect(barStoreAgain.count).toBe(1)

    barStoreAgain.increment()
    expect(barStore.count).toBe(2)
    expect(barStoreAgain.count).toBe(2)
  })

  it('should create a store with a closure function', () => {
    const useBarStore = useFooStore.withSuffix('bar')
    const barStore = useBarStore()
    expect(barStore).not.toBe(store)
    expect(barStore.$id).not.toBe(store.$id)
    expect(barStore.$id).toBeDefined()
  })

  it('should create a store that is persisted in pinia registry', () => {
    useFooStore.create('bar')
    expect(getActivePinia()._s.has('fooBar')).toBe(true)
  })

  it('should create a store that is persisted in pinia registry even after component is unmounted', () => {
    const setup = () => ({ storeId: useFooStore.create('bar').$id })
    const wrapper = shallowMount({ setup })
    expect(getActivePinia()._s.has(wrapper.vm.storeId)).toBe(true)
    wrapper.unmount()
    expect(getActivePinia()._s.has(wrapper.vm.storeId)).toBe(true)
  })

  it('should create a disposable store that is not persisted in pinia registry after component is unmounted', async () => {
    const setup = () => ({ storeId: useFooStore.disposable('bar').$id })
    const wrapper = shallowMount({ setup })
    expect(getActivePinia()._s.has(wrapper.vm.storeId)).toBe(true)
    await wrapper.unmount()
    expect(getActivePinia()._s.has(wrapper.vm.storeId)).toBe(false)
  })

  it('should create a store factory that can be used with `mapStores`', () => {
    const stores = mapStores(useFooStore)
    expect(stores).toHaveProperty('fooStore')
  })

  it('should create a store factory that can be used with `mapStores` in a component', async () => {
    const computed = mapStores(useFooStore)
    const component = { computed, template: '{{ fooStore.count }}' }
    const wrapper = shallowMount(component)
    expect(wrapper.text()).toEqual('0')
    useFooStore().increment()
    await flushPromises()
    expect(wrapper.text()).toEqual('1')
  })

  it('should create a store factory with a suffix that can be used with `mapStores`', () => {
    const stores = mapStores(useFooStore.withSuffix('bar'))
    expect(stores).toHaveProperty('fooBarStore')
  })

  it('should create a store factory with a suffix that can be used with `mapStores` in a component', async () => {
    const computed = mapStores(useFooStore.withSuffix('bar'))
    const component = { computed, template: '{{ fooBarStore.count }}' }
    const wrapper = shallowMount(component)
    expect(wrapper.text()).toEqual('0')
    useFooStore.create('bar').increment()
    await flushPromises()
    expect(wrapper.text()).toEqual('1')
  })

  it('should create a store factory that can be used with `mapState`', () => {
    const state = mapState(useFooStore, ['count'])
    expect(state).toHaveProperty('count')
  })

  it('should create a store factory that can be used with `mapState` in a component', async () => {
    const computed = mapState(useFooStore, ['count'])
    const component = { computed, template: '{{ count }}' }
    const wrapper = shallowMount(component)
    expect(wrapper.text()).toEqual('0')
    useFooStore().increment()
    await flushPromises()
    expect(wrapper.text()).toEqual('1')
  })

  it('should create a store with a suffix factory that can be used with `mapState`', () => {
    const state = mapState(useFooStore.withSuffix('bar'), ['count'])
    expect(state).toHaveProperty('count')
  })

  it('should create a store with a suffix factory that can be used with `mapState` in a component', async () => {
    const computed = mapState(useFooStore.withSuffix('bar'), ['count'])
    const component = { computed, template: '{{ count }}' }
    const wrapper = shallowMount(component)
    expect(wrapper.text()).toEqual('0')
    useFooStore.create('bar').increment()
    await flushPromises()
    expect(wrapper.text()).toEqual('1')
  })

  it('should camelCase the store id', () => {
    const useFooBarStore = defineSuffixedStore('foo bar', {})
    expect(useFooBarStore.$id).toBe('fooBar')
  })

  it('should camelCase the suffixed store id', () => {
    const useFooBarBazQuxStore = defineSuffixedStore('foo bar', {}).withSuffix('baz qux')
    expect(useFooBarBazQuxStore.$id).toBe('fooBarBazQux')
  })
})
