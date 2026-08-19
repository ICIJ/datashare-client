import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useSearchSaving } from '@/composables/useSearchSaving'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async () => {
  const { apiInstance } = await vi.importActual('@/api/apiInstance')
  return {
    apiInstance: {
      ...apiInstance,
      addHistoryEvent: vi.fn().mockResolvedValue({})
    }
  }
})

describe('useSearchSaving composable', () => {
  let core, plugins, searchStore, lockedFiltersStore

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    searchStore = useSearchStore()
    lockedFiltersStore = useLockedFiltersStore()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useSearchSaving()
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  describe('save (icij/datashare#2331 reverted)', () => {
    it('persists a saved-search URI that keeps a locked value', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { save } = mountComposable()
      await save({ name: 'My saved search' })

      expect(api.addHistoryEvent).toHaveBeenCalledOnce()
      const [, , , uri] = api.addHistoryEvent.mock.calls[0]
      expect(decodeURIComponent(uri)).toContain('f[contentType]')
    })

    it('keeps a value that is ticked but not locked in the saved-search URI', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'text/plain' })

      const { save } = mountComposable()
      await save({ name: 'My saved search' })

      const [, , , uri] = api.addHistoryEvent.mock.calls[0]
      expect(decodeURIComponent(uri)).toContain('f[contentType]')
    })

    it('keeps both values of a multi-value filter with no locks at all', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentType', value: 'image/jpeg' })

      const { save } = mountComposable()
      await save({ name: 'My saved search' })

      const [, , , uri] = api.addHistoryEvent.mock.calls[0]
      const decoded = decodeURIComponent(uri)
      expect(decoded).toContain('f[contentType]=application/pdf')
      expect(decoded).toContain('f[contentType]=image/jpeg')
    })

    it('keeps both values of a multi-value filter when one of them is locked', async () => {
      searchStore.addFilterValue({ name: 'contentType', value: 'application/pdf' })
      searchStore.addFilterValue({ name: 'contentType', value: 'image/jpeg' })
      lockedFiltersStore.lock({ name: 'contentType', value: 'application/pdf', label: 'application/pdf' })

      const { save } = mountComposable()
      await save({ name: 'My saved search' })

      const [, , , uri] = api.addHistoryEvent.mock.calls[0]
      const decoded = decodeURIComponent(uri)
      expect(decoded).toContain('f[contentType]=application/pdf')
      expect(decoded).toContain('f[contentType]=image/jpeg')
    })
  })
})
