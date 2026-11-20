import { setActivePinia, createPinia } from 'pinia'

import { useStructuredEntityModelStore } from '@/store/modules/structuredEntityModel'
import { apiInstance as api } from '@/api/apiInstance'

const ONTOLOGY = {
  name: 'ftm',
  version: '4.10.2',
  types: {
    Person: {
      name: 'Person',
      label: 'Person',
      abstract: false,
      featured: ['name', 'nationality', 'birthDate'],
      caption: ['name', 'alias'],
      edge: null,
      properties: { name: { label: 'Name', range: null, stub: false } }
    }
  }
}

describe('useStructuredEntityModelStore', () => {
  let spy

  beforeEach(() => {
    setActivePinia(createPinia())
    spy = vi.spyOn(api, 'getStructuredEntityModel')
  })

  afterEach(() => spy.mockRestore())

  it('requests the ftm ontology by default', async () => {
    spy.mockResolvedValue(ONTOLOGY)
    await useStructuredEntityModelStore().fetchOnce()
    expect(spy).toHaveBeenCalledWith('ftm')
  })

  // The payload is 233 KB. A list of 25 cards must not fetch it 25 times.
  it('fetches once however many callers ask', async () => {
    spy.mockResolvedValue(ONTOLOGY)
    const store = useStructuredEntityModelStore()
    await Promise.all([store.fetchOnce(), store.fetchOnce(), store.fetchOnce()])
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('exposes a type by name', async () => {
    spy.mockResolvedValue(ONTOLOGY)
    const store = useStructuredEntityModelStore()
    await store.fetchOnce()
    expect(store.type('Person').featured).toEqual(['name', 'nationality', 'birthDate'])
  })

  it('returns undefined for a type the ontology does not carry', async () => {
    spy.mockResolvedValue(ONTOLOGY)
    const store = useStructuredEntityModelStore()
    await store.fetchOnce()
    expect(store.type('Spaceship')).toBeUndefined()
  })

  // An older backend has no /api/models at all.
  it('leaves the model empty when the request fails, without throwing', async () => {
    spy.mockRejectedValue(new Error('404'))
    const store = useStructuredEntityModelStore()
    await expect(store.fetchOnce()).resolves.not.toThrow()
    expect(store.model).toBeNull()
    expect(store.types).toEqual({})
    expect(store.type('Person')).toBeUndefined()
  })

  it('retries after a failed fetch', async () => {
    const store = useStructuredEntityModelStore()
    spy.mockRejectedValueOnce(new Error('503'))
    await store.fetchOnce()
    expect(store.model).toBeNull()
    spy.mockResolvedValue(ONTOLOGY)
    await store.fetchOnce()
    expect(store.type('Person')).toBeTruthy()
  })
})
