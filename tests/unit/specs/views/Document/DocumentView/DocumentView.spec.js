import { shallowMount } from '@vue/test-utils'

import { apiInstance as api } from '@/api/apiInstance'
import { flushPromises } from '~tests/unit/tests_utils'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { useDocumentStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getUser: vi.fn(),
      addUserHistoryEvent: vi.fn(),
      getRecommendationsByDocuments: vi.fn(),
      getTags: vi.fn(),
      elasticsearch: {
        ...apiInstance.elasticsearch,
        getDocumentWithoutContent: vi.fn()
      }
    }
  }
})

describe('DocumentView.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'
  const parentId = 'parent_document'
  const props = { index: project, id, routing: parentId }

  let core, documentStore

  beforeEach(async () => {
    api.elasticsearch.getDocumentWithoutContent.mockResolvedValue({
      _id: id,
      _index: project,
      _source: {
        extractionLevel: 1,
        parentDocument: parentId,
        rootDocument: null
      }
    })

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

    core = CoreSetup.init().useAll().useRouter(routes)
    documentStore = useDocumentStore()
    await core.router.push({ name: 'document' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    documentStore.reset()
    core.config.merge({ dataDir: null, mountedDataDir: null })
  })

  it('should display an error message if document is not found', async () => {
    const props = { id: 'notfound', index: project }
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const spy = vi.spyOn(core.router, 'push')
    api.elasticsearch.getDocumentWithoutContent.mockRejectedValue(new Error('Not found'))
    shallowMount(DocumentView, { global, props })
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
    expect(api.elasticsearch.getDocumentWithoutContent).toBeCalledWith(project, id, parentId)
    // Find its parent
    expect(api.elasticsearch.getDocumentWithoutContent).toBeCalledWith(project, parentId, null)
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
