import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentModal from '@/components/Document/DocumentModal'
import { useDocumentStore } from '@/store/modules'

function createHit(id) {
  return { _id: id, _index: 'idx', _routing: id, _source: {} }
}

describe('DocumentModal.vue', () => {
  let core, documentStore

  beforeEach(async () => {
    vi.spyOn(api, 'addHistoryEvent').mockResolvedValue({})
    vi.spyOn(api.elasticsearch, 'getDocumentWithoutContent').mockImplementation((index, id) => createHit(id))
    const routes = [{ path: '/ds/:index/:id/:routing?', name: 'document-standalone' }]
    core = CoreSetup.init().useAll().useRouter(routes)
    documentStore = useDocumentStore()
    await core.router.push({ name: 'document-standalone', params: { index: 'idx', id: 'archive' } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the document of the page behind while showing its own', async () => {
    documentStore.document = new Document(createHit('archive'))
    const stubs = {
      DocumentFloating: { template: '<div><slot /></div>' },
      DocumentViewActions: true,
      DocumentViewTabs: true,
      DocumentViewTitle: true,
      DocumentViewUserActions: true
    }
    const props = { index: 'idx', id: 'child', routing: 'archive', modelValue: true }
    mount(DocumentModal, { global: { plugins: core.plugins, stubs }, props })
    await vi.waitFor(() => {
      expect(api.elasticsearch.getDocumentWithoutContent).toHaveBeenCalledWith('idx', 'child', 'archive')
    }, { timeout: 5000 })
    await flushPromises()
    expect(documentStore.document.id).toBe('archive')
  })
})
