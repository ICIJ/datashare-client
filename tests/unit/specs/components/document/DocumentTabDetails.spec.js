import { createLocalVue, mount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'

import { Core } from '@/core'
import DocumentTabDetails from '@/components/document/DocumentTabDetails'

describe('DocumentTabDetails.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  let wrapper, i18n, localVue, store, router
  beforeAll(() => {
    const api = { elasticsearch: es }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    router = core.router
    store = core.store
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
  })

  it('should display document path with config.mountedDataDir', async () => {
    Murmur.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__path input[type=text]').vm.value).toBe('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentType('application/pdf')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__content-type input[type=text]').vm.value).toBe(
      'Portable Document Format (PDF)'
    )
  })

  it('should display a child document', async () => {
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument, index).withResourceName('parentDocument')).commit()
    await letData(es).have(new IndexedDocument(id, index).withParent(parentDocument)).commit()
    await store
      .dispatch('document/get', { index, id, routing: parentDocument })
      .then(() => store.dispatch('document/getParent'))
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc, parentDocument: store.state.document.parentDocument }
    })

    expect(wrapper.find('.document__content__basename input[type=text]').vm.value).toBe(id)
    expect(wrapper.find('.document__content__tree-level input[type=text]').vm.value).toBe('1st')
    expect(wrapper.find('.document__content__parent input[type=text]').vm.value).toBe(parentDocument)
  })

  it('should not display the creation date if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })

  it('should display the creation date if it is defined', async () => {
    await letData(es).have(new IndexedDocument(id, index).withCreationDate('2020-12-04T00:00:01Z')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeTruthy()
  })

  it('should not display the author if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__author').exists()).toBeFalsy()
  })

  it('should display the author date if it is defined', async () => {
    await letData(es).have(new IndexedDocument(id, index).withAuthor('local')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__author').exists()).toBeTruthy()
  })

  it('should display a link to the list of children documents', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__shortcuts__children').exists()).toBeTruthy()
  })

  it('should display a link to the search in the folder of the document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__shortcuts__folder').exists()).toBeTruthy()
  })

  it('should display an "Unknown" file size', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__content-length').exists()).toBeTruthy()
    expect(wrapper.find('.document__content__content-length td:last-of-type').text().trim()).toBe('Unknown')
  })

  it('should display an file size', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContentLength('123456')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__content-length').exists()).toBeTruthy()
    expect(wrapper.find('.document__content__content-length input[type=text]').vm.value).toBe('120.56 KB (123456 B)')
  })

  it('should display the title and the normalized title', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = mount(DocumentTabDetails, {
      i18n,
      localVue,
      store,
      router,
      propsData: { document: store.state.document.doc }
    })

    expect(wrapper.find('.document__content__title').exists()).toBeTruthy()
  })
})
