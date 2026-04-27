import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useContentTypeCategoryAvailability } from '@/composables/useContentTypeCategoryAvailability'
import { useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

function buildMappingPayload(entries) {
  const payload = {}
  for (const [index, hasField] of Object.entries(entries)) {
    payload[index] = {
      mappings: hasField
        ? { contentTypeCategory: { full_name: 'contentTypeCategory', mapping: { contentTypeCategory: { type: 'keyword' } } } }
        : {}
    }
  }
  return payload
}

describe('useContentTypeCategoryAvailability composable', () => {
  let plugins, searchStore, wrapper

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    searchStore = useSearchStore()
    searchStore.reset()
    searchStore.setIndices([])
    vi.spyOn(api, 'getMappingsByFields').mockResolvedValue(buildMappingPayload({}))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    vi.restoreAllMocks()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useContentTypeCategoryAvailability()
        return result
      },
      template: '<div></div>'
    }
    wrapper = mount(TestComponent, { global: { plugins } })
    return result
  }

  it('reports isAvailable=true when every selected index exposes the field', async () => {
    searchStore.setIndices(['idx-a', 'idx-b'])
    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-a': true, 'idx-b': true })
    )

    const { isAvailable, error } = mountComposable()
    await flushPromises()

    expect(api.getMappingsByFields).toHaveBeenCalledWith('idx-a,idx-b', 'contentTypeCategory')
    expect(isAvailable.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('reports isAvailable=false when one of multiple indices is missing the field', async () => {
    searchStore.setIndices(['idx-a', 'idx-b'])
    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-a': true, 'idx-b': false })
    )

    const { isAvailable, error } = mountComposable()
    await flushPromises()

    expect(isAvailable.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('parses a string payload (responseType=text) and reports availability accordingly', async () => {
    searchStore.setIndices(['idx-a'])
    api.getMappingsByFields.mockResolvedValueOnce(
      JSON.stringify(buildMappingPayload({ 'idx-a': true }))
    )

    const { isAvailable } = mountComposable()
    await flushPromises()

    expect(isAvailable.value).toBe(true)
  })

  it('sets error and isAvailable=false on a network failure', async () => {
    searchStore.setIndices(['idx-a'])
    const networkError = new Error('boom')
    api.getMappingsByFields.mockRejectedValueOnce(networkError)

    const { isAvailable, error } = mountComposable()
    await flushPromises()

    expect(isAvailable.value).toBe(false)
    expect(error.value).toBe(networkError)
  })

  it('sets error and isAvailable=false on a parse failure', async () => {
    searchStore.setIndices(['idx-a'])
    api.getMappingsByFields.mockResolvedValueOnce('not json{')

    const { isAvailable, error } = mountComposable()
    await flushPromises()

    expect(isAvailable.value).toBe(false)
    expect(error.value).toBeInstanceOf(Error)
  })

  it('re-fetches when indices change and reflects the new availability', async () => {
    searchStore.setIndices(['idx-a'])
    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-a': true })
    )

    const { isAvailable } = mountComposable()
    await flushPromises()
    expect(isAvailable.value).toBe(true)

    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-c': false })
    )
    searchStore.setIndices(['idx-a', 'idx-c'])
    await flushPromises()

    expect(api.getMappingsByFields).toHaveBeenCalledTimes(2)
    expect(api.getMappingsByFields).toHaveBeenLastCalledWith('idx-c', 'contentTypeCategory')
    expect(isAvailable.value).toBe(false)
  })

  it('caches per-index results and skips refetching already-known indices', async () => {
    searchStore.setIndices(['idx-a'])
    api.getMappingsByFields.mockResolvedValueOnce(
      buildMappingPayload({ 'idx-a': true })
    )

    const { isAvailable } = mountComposable()
    await flushPromises()
    expect(isAvailable.value).toBe(true)

    searchStore.setIndices([])
    await flushPromises()
    expect(isAvailable.value).toBe(false)

    searchStore.setIndices(['idx-a'])
    await flushPromises()

    expect(api.getMappingsByFields).toHaveBeenCalledTimes(1)
    expect(isAvailable.value).toBe(true)
  })

  it('reports isAvailable=false when no indices are selected', async () => {
    const { isAvailable, error } = mountComposable()
    await flushPromises()

    expect(isAvailable.value).toBe(false)
    expect(error.value).toBeNull()
    expect(api.getMappingsByFields).not.toHaveBeenCalled()
  })
})
