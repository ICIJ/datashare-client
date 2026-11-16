import { flushPromises, mount } from '@vue/test-utils'
import { BModal } from 'bootstrap-vue-next'

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

  function mountModal() {
    const stubs = { DocumentView: true, DocumentFloating: { template: '<div><slot /></div>' } }
    const props = { index: 'idx', id: 'child', routing: 'archive', modelValue: true }
    return mount(DocumentModal, { global: { plugins: core.plugins, stubs }, props })
  }

  it('restores the document of the page behind once hidden', async () => {
    const wrapper = mountModal()
    documentStore.document = new Document(createHit('child'))
    wrapper.findComponent(BModal).vm.$emit('hidden')
    await flushPromises()
    expect(documentStore.document.id).toBe('archive')
  })
})
