import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { flushPromises } from '~tests/unit/tests_utils'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import DocumentActions from '@/components/DocumentActions'

describe('DocumentActions.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  let api, core, document, store, wrapper

  beforeAll(() => {
    api = { starDocuments: vi.fn(), unstarDocuments: vi.fn() }
    core = CoreSetup.init(api).useAll()

    core.config.merge({
      projects: [process.env.VITE_ES_INDEX],
      embeddedDocumentDownloadMaxSize: '1G'
    })
  })

  beforeEach(async () => {
    core.store.commit('starred/documents', [])
    const indexedDocument = await letData(es).have(new IndexedDocument('document', project)).commit()
    document = indexedDocument.document
    wrapper = shallowMount(DocumentActions, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: {
        document
      }
    })
  })

  it('should display a filled star if document is starred, an empty one otherwise', async () => {
    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('far,star')
    core.store.commit('starred/documents', [document])
    await flushPromises()

    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace an empty star by a filled one on click on it', async () => {
    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('far,star')

    await wrapper.vm.toggleStarDocument()

    expect(wrapper.vm.starredDocuments).toEqual([
      {
        id: document.id,
        index: document.index
      }
    ])
    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace a filled star by an empty one on click on it', async () => {
    core.store.commit('starred/pushDocument', document)
    await flushPromises()

    expect(wrapper.vm.starredDocuments).toEqual([
      {
        id: document.id,
        index: document.index
      }
    ])
    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('fa,star')

    await wrapper.vm.toggleStarDocument()

    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star font-awesome-icon-stub').attributes('icon')).toBe('far,star')
  })

  it('should raise an "filter::starred::refresh" event when adding a star', async () => {
    const mockCallback = vi.fn()
    core.on('filter::starred::refresh', mockCallback)

    await wrapper.vm.toggleStarDocument()

    expect(mockCallback).toHaveBeenCalled()
  })

  it('should not display "Download" button if download is not allowed', () => {
    expect(wrapper.find('.document-actions__download').exists()).toBeFalsy()
  })

  it('should display "Download" button if download is allowed', () => {
    wrapper = shallowMount(DocumentActions, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: {
        document,
        isDownloadAllowed: true
      }
    })

    expect(wrapper.find('.document-actions__download').exists()).toBeTruthy()
  })

  it('should not display "Download parent" button if document has no parent', () => {
    wrapper = shallowMount(DocumentActions, {
      global: {
        plugins: core.plugins
      },
      props: {
        document,
        isDownloadAllowed: true,
        displayDownloadOptions: true
      }
    })

    expect(wrapper.vm.hasRoot).toBeFalsy()
  })

  it('should display "Download parent" button if document has a parent', async () => {
    await letData(es).have(new IndexedDocument('parent_document', project)).commit()
    const indexedDocument = await letData(es)
      .have(new IndexedDocument('another_document', project).withParent('parent_document').withRoot('parent_document'))
      .commit()
    document = indexedDocument.document
    wrapper = shallowMount(DocumentActions, {
      global: {
        plugins: core.plugins
      },
      props: {
        document,
        isDownloadAllowed: true,
        displayDownloadOptions: true
      }
    })

    expect(wrapper.vm.hasRoot).toBeTruthy()
  })
})
