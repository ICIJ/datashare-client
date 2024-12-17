import { shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import { flushPromises } from '~tests/unit/tests_utils'
import DocumentView from '@/views/DocumentView'

describe('DocumentView.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'
  const parentId = 'parent_document'
  const props = { index: project, id, routing: parentId }

  let core, api

  beforeAll(() => {
    api = {
      getUser: vi.fn(),
      addUserHistoryEvent: vi.fn(),
      getRecommendationsByDocuments: vi.fn(),
      getTags: vi.fn(),
      elasticsearch: es
    }
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    await letData(es).have(new IndexedDocument(parentId, project)).commit()
    await letData(es).have(new IndexedDocument(id, project).withParent(parentId)).commit()
    core = CoreSetup.init(api).useAll().useRouter()
    core.store.commit('document/doc', { _id: id, _index: project, _source: { extractionLevel: 1 } })
  })

  afterEach(() => {
    core.store.commit('document/reset')
    core.config.merge({ dataDir: null, mountedDataDir: null })
  })

  it('should display an error message if document is not found', async () => {
    const props = { id: 'notfound', index: project }
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    await wrapper.vm.getDoc()
    expect(wrapper.find('span').text()).toBe('Document not found')
  })

  it('should call the elasticsearch to retrieve document parent', async () => {
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })
    const spyElasticsearchGet = vi.spyOn(api.elasticsearch, 'get')
    await wrapper.vm.getDoc()
    const payload = { index: project, id: parentId, routing: null, _source_excludes: 'content,content_translated' }
    expect(spyElasticsearchGet).toBeCalledWith(expect.objectContaining(payload))
  })

  it('should call the API to retrieve document tags', async () => {
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })
    await wrapper.vm.getDoc()
    expect(api.getTags).toBeCalledWith(project, id)
  })

  it('should call the API to retrieve document recommendations', async () => {
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    await wrapper.vm.getDoc()
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
    await wrapper.vm.getDoc()
    expect(wrapper.find('.document__header').element).toBeTruthy()
  })

  it('should display the named entities tab', async () => {
    core.config.merge({ dataDir: null, mountedDataDir: null, manageDocuments: true })
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    await wrapper.vm.getDoc()
    const items = wrapper.findAll('.document .document__header__nav__item')
    expect(items).toHaveLength(4)
    expect(items.at(3).attributes('title')).toContain('Named Entities')
  })

  it('should NOT display the named entities tab', async () => {
    core.config.merge({ manageDocuments: false })
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    await wrapper.vm.getDoc()
    const items = wrapper.findAll('.document .document__header__nav__item')
    expect(items).toHaveLength(3)
    expect(items.at(2).attributes('title')).not.toContain('Named Entities')
  })

  it('should call the API to add document to history', async () => {
    const wrapper = shallowMount(DocumentView, {
      global: {
        plugins: core.plugins
      },
      props
    })
    await flushPromises()
    await wrapper.vm.getDoc()
    expect(api.addUserHistoryEvent).toBeCalled() // CD TODO: flaky test about number of calls (mounter + call)
  })

  describe('navigate through tabs as loop', () => {
    let wrapper

    beforeEach(async () => {
      wrapper = shallowMount(DocumentView, { global: { plugins: core.plugins }, props })
      await wrapper.vm.getDoc()
    })

    it('should set the previous tab as active', () => {
      wrapper.setData({ activeTab: 'preview' })
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })

    it('should set the next tab as active', () => {
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('preview')
    })

    it('should set the last tab as active', () => {
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('details')
    })

    it('should set the first tab as active', () => {
      wrapper.setData({ activeTab: 'details' })
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })
  })

  describe('transform the tabs array through a pipeline', () => {
    const temporaryPipelineName = 'document-view-tabs-add-tmp-tab'
    let wrapper

    beforeEach(async () => {
      core.registerPipeline({
        name: temporaryPipelineName,
        category: 'document-view-tabs',
        type(tabs, document) {
          const tab = { name: 'tmp', label: 'Temporary' }
          return [...tabs, tab]
        }
      })

      wrapper = shallowMount(DocumentView, {
        global: {
          plugins: core.plugins
        },
        props
      })

      await wrapper.vm.getDoc()
    })

    afterEach(() => {
      core.unregisterPipeline(temporaryPipelineName)
    })

    it('should add a tab using the `document-view-tabs` pipeline', () => {
      const lastTab = wrapper.vm.tabsThroughPipeline[wrapper.vm.tabsThroughPipeline.length - 1]
      expect(lastTab.label).toBe('Temporary')
    })

    it('should add a tab with a `labelComponent` property', () => {
      const lastTab = wrapper.vm.tabsThroughPipeline[wrapper.vm.tabsThroughPipeline.length - 1]
      expect(lastTab.labelComponent).toHaveProperty('template')
    })

    it('should add a tab with a `labelComponent` within the label in its template', () => {
      const lastTab = wrapper.vm.tabsThroughPipeline[wrapper.vm.tabsThroughPipeline.length - 1]
      const lastTabWrapper = shallowMount(lastTab.labelComponent, { global: { plugins: core.plugins } })
      expect(lastTabWrapper.text()).toBe('Temporary')
    })
  })
})
