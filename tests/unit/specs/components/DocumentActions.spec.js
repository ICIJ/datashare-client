import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { flushPromises } from 'tests/unit/tests_utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import DocumentActions from '@/components/DocumentActions'
import { Core } from '@/core'
import { Api } from '@/api'

describe('DocumentActions.vue', () => {
  let i18n, localVue, store, mockAxios, api
  const { index: project, es } = esConnectionHelper.build()
  let document = null
  let wrapper = null

  beforeAll(() => {
    mockAxios = { request: jest.fn().mockResolvedValue({ data: {} }) }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store

    Murmur.config.merge({ userProjects: [process.env.VUE_APP_ES_INDEX] })
  })

  beforeEach(async () => {
    store.commit('starred/documents', [])
    const indexedDocument = await letData(es).have(new IndexedDocument('document', project)).commit()
    document = indexedDocument.document
    wrapper = shallowMount(DocumentActions, {
      i18n,
      localVue,
      store,
      propsData: { document },
      sync: false
    })
  })

  it('should display a filled star if document is starred, an empty one otherwise', async () => {
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')
    store.commit('starred/documents', [document])
    await flushPromises()

    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace an empty star by a filled one on click on it', async () => {
    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')

    await wrapper.vm.toggleStarDocument()

    expect(wrapper.vm.starredDocuments).toEqual([
      {
        id: document.id,
        index: document.index
      }
    ])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace a filled star by an empty one on click on it', async () => {
    store.commit('starred/pushDocument', document)
    await flushPromises()

    expect(wrapper.vm.starredDocuments).toEqual([
      {
        id: document.id,
        index: document.index
      }
    ])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')

    await wrapper.vm.toggleStarDocument()

    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')
  })

  it('should raise an "filter::starred::refresh" event when adding a star', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::starred::refresh', mockCallback)

    await wrapper.vm.toggleStarDocument()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should NOT display "Download" button if download is not allowed', () => {
    expect(wrapper.find('.document-actions__download').exists()).toBeFalsy()
  })

  it('should display "Download" button if download is allowed', () => {
    wrapper = shallowMount(DocumentActions, {
      i18n,
      localVue,
      store,
      propsData: {
        document,
        isDownloadAllowed: true
      },
      sync: false
    })

    expect(wrapper.find('.document-actions__download').exists()).toBeTruthy()
  })

  it('should NOT display "Download parent" button if document has no parent', () => {
    wrapper = shallowMount(DocumentActions, {
      i18n,
      localVue,
      store,
      propsData: {
        document,
        isDownloadAllowed: true
      },
      sync: false
    })

    expect(wrapper.vm.hasRoot).toBeFalsy()
    expect(wrapper.find('.document-actions__download-parent').exists()).toBeFalsy()
  })

  it('should display "Download parent" button if document has a parent', async () => {
    await letData(es).have(new IndexedDocument('parent_document', project)).commit()
    const indexedDocument = await letData(es)
      .have(new IndexedDocument('another_document', project).withParent('parent_document').withRoot('parent_document'))
      .commit()
    document = indexedDocument.document
    wrapper = shallowMount(DocumentActions, {
      i18n,
      localVue,
      store,
      propsData: {
        document,
        isDownloadAllowed: true
      },
      sync: false
    })

    expect(wrapper.vm.hasRoot).toBeTruthy()
    expect(wrapper.find('.document-actions__download-root').exists()).toBeTruthy()
  })
})
