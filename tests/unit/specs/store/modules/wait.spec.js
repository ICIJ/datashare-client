import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

import { useWaitStore } from '@/store/modules/wait'

describe('WaitStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should set and get a loader value for the global scope when scope is null', () => {
    const waitStore = useWaitStore()
    // Initially, no value is set for the loader
    expect(waitStore.get(null, 'loader1')).toBeUndefined()

    // Setting the loader value with a null scope should default to the global scope ("__global__")
    waitStore.set(null, 'loader1', true)
    expect(waitStore.get(null, 'loader1')).toBe(true)
    expect(waitStore.loaders.__global__).toBeDefined()
    expect(waitStore.loaders.__global__.loader1).toBe(true)
  })

  it('should set and get a loader value for a specific scope', () => {
    const waitStore = useWaitStore()
    const scopeKey = 'myScope'

    // Initially, no value is set for the loader in the specified scope
    expect(waitStore.get(scopeKey, 'loader2')).toBeUndefined()

    // Setting the loader value for a custom scope
    waitStore.set(scopeKey, 'loader2', false)
    expect(waitStore.get(scopeKey, 'loader2')).toBe(false)
    expect(waitStore.loaders[scopeKey]).toBeDefined()
    expect(waitStore.loaders[scopeKey].loader2).toBe(false)
  })

  it('should update a loader value', () => {
    const waitStore = useWaitStore()
    // Set an initial value
    waitStore.set(null, 'loader3', false)
    expect(waitStore.get(null, 'loader3')).toBe(false)

    // Update the value and verify the change
    waitStore.set(null, 'loader3', true)
    expect(waitStore.get(null, 'loader3')).toBe(true)
  })

  it('should work with ref inputs for scope and id', () => {
    const waitStore = useWaitStore()
    const scopeRef = ref('refScope')
    const idRef = ref('loader4')

    waitStore.set(scopeRef, idRef, true)
    expect(waitStore.get(scopeRef, idRef)).toBe(true)
    expect(waitStore.loaders.refScope).toBeDefined()
    expect(waitStore.loaders.refScope.loader4).toBe(true)
  })

  it('should return undefined for a non-existing loader', () => {
    const waitStore = useWaitStore()
    expect(waitStore.get(null, 'nonExisting')).toBeUndefined()
  })

  it('should default to global scope when scopeKeyRef is undefined', () => {
    const waitStore = useWaitStore()
    waitStore.set(undefined, 'loader5', true)
    expect(waitStore.get(undefined, 'loader5')).toBe(true)
    expect(waitStore.loaders.__global__.loader5).toBe(true)
  })
})
