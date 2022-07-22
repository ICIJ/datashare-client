import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import { Core } from '@/core'
import DocumentTabDetails from '@/components/document/DocumentTabDetails'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

jest.mock('axios')

describe('DocumentTabDetails.vue', () => {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  let wrapper = null

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display document path with config.mountedDataDir', async () => {
    Murmur.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__path').text()).toBe('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentType('application/pdf')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__content-type').text()).toBe('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument, index)).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(parentDocument)).commit()
    await store.dispatch('document/get', { index, id, routing: parentDocument }).then(() => store.dispatch('document/getParent'))
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc, parentDocument: store.state.document.parentDocument } })

    expect(wrapper.find('.document__content__basename').text()).toBe(id)
    expect(wrapper.find('.document__content__tree-level').text()).toBe('1st')
    expect(wrapper.find('.document__content__parent').text()).toBe(parentDocument)
  })

  it('should not display the creation date if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })

  it('should display a link to the list of children documents', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__shortcuts__children').exists()).toBeTruthy()
  })

  it('should display a link to the search in the folder of the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__shortcuts__folder').exists()).toBeTruthy()
  })

  it('should display an "Unknown" file size', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__content-length').exists()).toBeTruthy()
    expect(wrapper.find('.document__content__content-length').text()).toBe('Unknown')
  })

  it('should display an file size', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentLength('123456')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { i18n, localVue, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__content-length').exists()).toBeTruthy()
    expect(wrapper.find('.document__content__content-length').text()).toBe('120.56 KB (123456 B)')
  })
})
