import { setActivePinia, createPinia } from 'pinia'

import { usePlayerStore } from '@/store/modules'

describe('PlayerStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = usePlayerStore()
  })

  it('should set autoplay to false by default', () => {
    expect(store.autoplay).toBe(false)
  })

  it('should set loop to true by default', () => {
    expect(store.loop).toBe(true)
  })
})
