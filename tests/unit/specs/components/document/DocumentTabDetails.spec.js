import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import { App } from '@/main'
import { datashare } from '@/store/modules/document'
import DocumentTabDetails from '@/components/document/DocumentTabDetails'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonOk } from 'tests/unit/tests_utils'

const { localVue, router, store } = App.init(createLocalVue()).useAll()

describe('DocumentTabDetails.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const index = process.env.VUE_APP_ES_INDEX
  const id = 'document'
  let wrapper

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk([]))
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    datashare.fetch.mockRestore()
  })

  it('should display document path with config.mountedDataDir', async () => {
    Murmur.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { localVue, store, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__path').text()).toEqual('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    await letData(es).have(new IndexedDocument(id).withContentType('application/pdf')).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { localVue, store, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__content-type').text()).toEqual('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument)).commit()
    await letData(es).have(new IndexedDocument(id).withParent(parentDocument)).commit()
    await store.dispatch('document/get', { index, id, routing: parentDocument }).then(() => store.dispatch('document/getParent'))
    wrapper = shallowMount(DocumentTabDetails, { localVue, store, router, propsData: { document: store.state.document.doc, parentDocument: store.state.document.parentDocument }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__basename').text()).toEqual(id)
    expect(wrapper.find('.document__content__tree-level').text()).toEqual('facet.level.level01')
    expect(wrapper.find('.document__content__parent').text()).toEqual(parentDocument)
  })

  it('should not display the creation date if it is missing', async () => {
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { localVue, store, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })

  it('should display a link to the list of children documents', async () => {
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id, index })
    wrapper = shallowMount(DocumentTabDetails, { localVue, store, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__details__children').exists()).toBeTruthy()
  })
})
