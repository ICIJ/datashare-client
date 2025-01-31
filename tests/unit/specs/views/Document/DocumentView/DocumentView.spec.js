import { shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { flushPromises } from '~tests/unit/tests_utils'
import DocumentView from '@/views/Document/DocumentView/DocumentView'

describe('DocumentView.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'
  const parentId = 'parent_document'
  const props = { index: project, id, routing: parentId }

  let core, api, getDocumentWithoutContent

  beforeEach(async () => {
    getDocumentWithoutContent = vi.fn().mockResolvedValue({
      _id: id,
      _index: project,
      _source: {
        extractionLevel: 1,
        parentDocument: parentId,
        rootDocument: null
      }
    })

    api = {
      getUser: vi.fn(),
      addUserHistoryEvent: vi.fn(),
      getRecommendationsByDocuments: vi.fn(),
      getTags: vi.fn(),
      elasticsearch: { ...es, getDocumentWithoutContent }
    }

    await letData(es).have(new IndexedDocument(parentId, project)).commit()
    await letData(es).have(new IndexedDocument(id, project).withParent(parentId)).commit()

    const routes = [
      { path: '/', name: 'index' },
      { path: '/error', name: 'error' },
      { path: '/document', name: 'document' },
      { path: '/document/text', name: 'document.text' },
      { path: '/document/viewer', name: 'document.viewer' },
      { path: '/document/entities', name: 'document.entities' },
      { path: '/error', name: 'error' },
      { path: '/document/metadata', name: 'document.metadata' }
    ]

    core = CoreSetup.init(api).useAll().useRouter(routes)
    await core.router.push({ name: 'document' })
  })

  afterEach(() => {
    core.store.commit('document/reset')
    core.config.merge({ dataDir: null, mountedDataDir: null })
    vi.clearAllMocks()
  })

  it('should display an error message if document is not found', async () => {
    const props = { id: 'notfound', index: project }
    const spy = vi.spyOn(core.router, 'push')
    getDocumentWithoutContent.mockRejectedValue(new Error('Not found'))

    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'error' }))
  })

  it('should call the retrieve the document and its parent', async () => {
    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })
    await flushPromises()
    // Find doc
    expect(getDocumentWithoutContent).toBeCalledWith(project, id, parentId)
    // Find its parent
    expect(getDocumentWithoutContent).toBeCalledWith(project, parentId, null)
  })

  it('should call the API to retrieve document tags', async () => {
    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })

    await flushPromises()

    expect(api.getTags).toBeCalledWith(project, id)
  })

  it('should call the API to retrieve document recommendations', async () => {
    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()

    expect(api.getRecommendationsByDocuments).toBeCalledWith(project, id)
  })

  it('should display a document', async () => {
    core.config.merge({ dataDir: null, mountedDataDir: null })

    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()

    expect(wrapper.find('.document-view__header').exists()).toBe(true)
  })

  it('should call the API to add document to history', async () => {
    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })

    await flushPromises()

    expect(api.addUserHistoryEvent).toBeCalledTimes(1)
  })
})
