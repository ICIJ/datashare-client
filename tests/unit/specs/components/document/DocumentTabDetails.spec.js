import VueI18n from 'vue-i18n'
import { createServer } from 'http-server'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import DocumentTabDetails from '@/components/document/DocumentTabDetails'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import '@/utils/font-awesome'
import { datashare } from '@/store/modules/document'
import { jsonOk } from 'tests/unit/tests_utils'
import esClient from '@/api/esClient'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('DocumentTabDetails.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer, spy

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    spy = jest.spyOn(esClient, 'getEsDoc')
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
    const wrapper = shallowMount(DocumentTabDetails, { localVue, i18n, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__path').text()).toEqual('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    const id = 'doc_01'
    await letData(es).have(new IndexedDocument(id).withContentType('application/pdf')).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, i18n, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__content-type').text()).toEqual('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const document = 'document'
    const parentDocument = 'parentDocument'
    await letData(es).have(new IndexedDocument(parentDocument)).commit()
    await letData(es).have(new IndexedDocument(document).withParent(parentDocument)).commit()
    await store.dispatch('document/get', { id: document, routing: parentDocument }).then(() => store.dispatch('document/getParent'))
    const wrapper = shallowMount(DocumentTabDetails, { localVue, i18n, router, propsData: { document: store.state.document.doc, parentDocument: store.state.document.parentDocument } })

    expect(wrapper.find('.document__content__basename').text()).toEqual(document)
    expect(wrapper.find('.document__content__tree-level').text()).toEqual('1st')
    expect(wrapper.find('.document__content__parent').text()).toEqual(parentDocument)
  })

  it('should not display the creation date if its missing', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabDetails, { localVue, i18n, propsData: { document: store.state.document.doc } })

    expect(wrapper.find('.document__content__creation-date').exists()).toBeFalsy()
  })
})
