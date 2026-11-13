import { shallowMount, flushPromises } from '@vue/test-utils'
import { RouterView } from 'vue-router'

import { apiInstance as api } from '@/api/apiInstance'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { useDocumentStore } from '@/store/modules'
import { MODE_NAME } from '@/mode'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getUser: vi.fn().mockResolvedValue({ uid: 'local' }),
      addHistoryEvent: vi.fn(),
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
      { path: '/:pathMatch(.*)*', name: 'error' },
      { path: '/document', name: 'document' },
      { path: '/document-standalone', name: 'document-standalone' }
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

  afterAll(() => {
    vi.resetAllMocks()
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

  it('should pass the fetch error to the error page', async () => {
    const props = { id: 'notfound', index: project }
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const error = Object.assign(new Error('Not Found'), { status: 404 })
    api.elasticsearch.getDocumentWithoutContent.mockRejectedValue(error)
    shallowMount(DocumentView, { global, props })
    await flushPromises()
    const details = { index: project, id: 'notfound', routing: undefined }
    expect(core.router.currentRoute.value.name).toBe('error')
    expect(core.router.currentRoute.value.fullPath).toBe('/document')
    expect(window.history.state).toMatchObject({ error: 'Not Found', code: 404, details, reason: 'document' })
  })

  it('should keep the page behind a modal and show the document URL on the error page', async () => {
    await core.router.push({ name: 'index' })
    const props = { id: 'notfound', index: project }
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    api.elasticsearch.getDocumentWithoutContent.mockRejectedValue(new Error('Not found'))
    shallowMount(DocumentView, { global, props })
    await flushPromises()
    expect(core.router.currentRoute.value.name).toBe('error')
    expect(core.router.currentRoute.value.fullPath).toBe('/document-standalone')
    expect(window.history.state.back).toBe('/')
  })

  it('should keep the previous document in the history when the next one fails', async () => {
    const routes = [
      { path: '/:pathMatch(.*)*', name: 'error' },
      { path: '/ds/:index/:id', name: 'document-standalone', component: DocumentView, props: true }
    ]
    const core = CoreSetup.init().useAll().useRouter(routes)
    await core.router.push({ name: 'document-standalone', params: { index: project, id } })
    const global = { plugins: core.plugins, stubs: { RouterView: false, DocumentView: false } }
    shallowMount(RouterView, { global })
    await flushPromises()
    api.elasticsearch.getDocumentWithoutContent.mockRejectedValue(new Error('Not found'))
    await core.router.push({ name: 'document-standalone', params: { index: project, id: 'notfound' } })
    await flushPromises()
    expect(core.router.currentRoute.value.name).toBe('error')
    expect(window.history.state.back).toBe(`/ds/${project}/${id}`)
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

  it('should call the API to retrieve document recommendations in server mode', async () => {
    core.config.set('mode', MODE_NAME.SERVER)

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

  it('should still add the document to history in server mode when the server cannot tell who the user is', async () => {
    core.config.set('mode', MODE_NAME.SERVER)
    const error = Object.assign(new Error('Server error'), { response: { status: 500 } })
    api.getUser.mockRejectedValueOnce(error)

    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()

    expect(api.addHistoryEvent).toBeCalledTimes(1)
  })

  it('should not refresh the document recommendations in server mode when the server cannot tell who the user is', async () => {
    core.config.set('mode', MODE_NAME.SERVER)
    const error = Object.assign(new Error('Server error'), { response: { status: 500 } })
    api.getUser.mockRejectedValueOnce(error)

    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()

    expect(api.getRecommendationsByDocuments).not.toBeCalled()
  })

  it('should not call the API to retrieve document recommendations in local mode', async () => {
    core.config.set('mode', MODE_NAME.LOCAL)

    shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })

    await flushPromises()

    expect(api.getRecommendationsByDocuments).not.toHaveBeenCalled()
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

    expect(api.addHistoryEvent).toBeCalledTimes(1)
  })
})
