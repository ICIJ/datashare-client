import { createServer } from 'http-server'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import DocumentTabDetails from '@/components/document/DocumentTabDetails'
import store from '@/store'
import router from '@/router'
import '@/utils/font-awesome'
import { datashare } from '@/store/modules/document'
import { jsonOk } from 'tests/unit/tests_utils'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(Murmur)

describe('DocumentTabDetails.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    datashare.fetch.mockRestore()
  })

  afterAll(() => httpServer.close())

  it('should display document path with config.mountedDataDir', async () => {
    Murmur.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const id = '/home/datashare/data/foo.txt'
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__path').text()).toEqual('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id).withContentType('application/pdf')).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__content-type').text()).toEqual('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const document = 'document'
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument)).commit()
    await letData(es).have(new IndexedDocument(document).withParent(parentDocument)).commit()
    await store.dispatch('document/get', { id: document, routing: parentDocument }).then(() => store.dispatch('document/getParent'))
    const wrapper = shallowMount(DocumentTabDetails, { localVue, router, propsData: { document: store.state.document.doc, parentDocument: store.state.document.parentDocument }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__basename').text()).toEqual(document)
    expect(wrapper.find('.document__content__tree-level').text()).toEqual('facet.level.level_01')
    expect(wrapper.find('.document__content__parent').text()).toEqual(parentDocument)
  })

  it('should not display the creation date if it is missing', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })

  it('should display a link to the list of children documents', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, propsData: { document: store.state.document.doc }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })
})
