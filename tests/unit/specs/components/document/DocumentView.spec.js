import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import DocumentView from '@/components/document/DocumentView'
import { EventBus } from '@/utils/event-bus'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages }, silentTranslationWarn: true })

describe('DocumentView.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
  })

  afterAll(() => httpServer.close())

  it('should display an error message when document is not found', async () => {
    const id = 'notfound'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await wrapper.vm.getDoc()

    expect(wrapper.find('span').text()).toEqual('Document not found')
  })

  it('should display a document', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    const id = 'foo.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.find('.document__content__basename').text()).toEqual(id)
  })

  it('should display document path with config.mountedDataDir', async () => {
    const id = '/home/datashare/data/foo.txt'
    Murmur.config.merge({ dataDir: '/home/datashare/data', mountedDataDir: 'C:/Users/ds/docs' })
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id).withContent('this is foo document')).commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('dd').at(1).text()).toEqual('C:/Users/ds/docs/foo.txt')
  })

  it('should display the document type', async () => {
    const id = 'doc_01.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id).withContent('content').withContentType('application/pdf')).commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('dd').at(5).text()).toEqual('Portable Document Format (PDF)')
  })

  it('should display a child document', async () => {
    const id = 'child.txt'
    const routing = 'parent.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id, routing } })

    await letData(es).have(new IndexedDocument(routing)
      .withContent('this is a parent document'))
      .commit()
    await letData(es).have(new IndexedDocument(id)
      .withContent('this is a children document')
      .withParent(routing))
      .commit()

    await wrapper.vm.getDoc()

    expect(wrapper.find('.document__content__basename').text()).toEqual(id)
    expect(wrapper.find('.document__content__tree-level').text()).toEqual('1st')
  })

  it('should mark named entities', async () => {
    const id = 'mydoc.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('a NER doc with 2 NER2')
      .withNer('NER', 2, 'CATEGORY1')
      .withNer('NER2', 17, 'CATEGORY2'))
      .commit()

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('mark')).toHaveLength(2)
    expect(wrapper.findAll('mark').at(0).text()).toEqual('NER')
    expect(wrapper.findAll('mark').at(0).classes()).toContain('bg-category-category1')
    expect(wrapper.findAll('mark').at(1).text()).toEqual('NER2')
    expect(wrapper.findAll('mark').at(1).classes()).toContain('bg-category-category2')
  })

  it('should display a document with named entities and escaped HTML', async () => {
    const id = 'html_doc.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withNer('foo', 2))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.find('.text-pre-wrap').html()).toEqual(
      '<div class="tab-pane text-pre-wrap">a <mark class="ner bg-category-person">foo</mark> document &lt;with&gt;HTML&lt;/with&gt;</div>')
  })

  it('should display named entities in the dedicated tab', async () => {
    const id = 'html_doc.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withPipeline('CORENLP')
      .withNer('mention_01', 2, 'CATEGORY_01')
      .withNer('mention_02', 5, 'CATEGORY_02')
      .withNer('mention_03', 12, 'CATEGORY_03'))
      .commit()
    await wrapper.vm.getDoc()

    const pills = wrapper.findAll('.document__named-entities .badge-pill')

    expect(pills).toHaveLength(3)
    expect(pills.at(0).find('.badge-pill > span').text()).toEqual('mention_01')
    expect(pills.at(0).classes()).toContain('border-category-category_01')
    expect(pills.at(1).find('.badge-pill > span').text()).toEqual('mention_02')
    expect(pills.at(1).classes()).toContain('border-category-category_02')
    expect(pills.at(2).find('.badge-pill > span').text()).toEqual('mention_03')
    expect(pills.at(2).classes()).toContain('border-category-category_03')
  })

  it('should call the SpreadsheetViewer stub for XLSX document', async () => {
    const id = 'spreadsheet.xlsx'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commit()

    wrapper.vm.tab = 'preview'
    await wrapper.vm.getDoc()

    expect(wrapper.contains('spreadsheet-viewer-stub')).toBeTruthy()
  })

  it('should call the SpreadsheetViewer stub for CSV document', async () => {
    const id = 'spreadsheet.csv'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('text/csv'))
      .commit()

    wrapper.vm.tab = 'preview'
    await wrapper.vm.getDoc()

    expect(wrapper.contains('spreadsheet-viewer-stub')).toBeTruthy()
  })

  it('should call the PdfViewer stub for PDF document', async () => {
    const id = 'document.pdf'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, router, store, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/pdf'))
      .commit()

    wrapper.vm.tab = 'preview'
    await wrapper.vm.getDoc()

    expect(wrapper.contains('pdf-viewer-stub')).toBeTruthy()
  })

  it('should call the TiffViewer stub for TIFF document', async () => {
    const id = 'image.tiff'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, router, store, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('image/tiff'))
      .commit()

    wrapper.vm.tab = 'preview'
    await wrapper.vm.getDoc()

    expect(wrapper.contains('tiff-viewer-stub')).toBeTruthy()
  })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    const id = 'test.doc'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent(''))
      .commit()

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .tab-pane.document__named-entities .document__named-entities--not--searched')).toHaveLength(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    const id = 'test.doc'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withPipeline('CORENLP'))
      .commit()

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .tab-pane.document__named-entities .document__named-entities--not--found')).toHaveLength(1)
  })

  it('should reload the named entities search on custom event emitted', async () => {
    const id = 'mydoc.txt'
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    let indexBuilder = await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withPipeline('CORENLP')
      .withNer('mention_01', 2, 'CATEGORY_01')
      .withNer('mention_02', 5, 'CATEGORY_02'))
      .commit()

    await wrapper.vm.getDoc()
    expect(wrapper.findAll('.document__named-entities .badge-pill')).toHaveLength(2)

    await indexBuilder.hideNer('mention_02')
    EventBus.$emit('facet::hide::named-entities')
    await delay(100)
    expect(wrapper.findAll('.document__named-entities .badge-pill')).toHaveLength(1)
  })

  it('should display the named entities tab in LOCAL mode', async () => {
    const id = 'foo.txt'
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(4)
    expect(wrapper.findAll('.document .document__header__nav__item').at(1).text()).toContain('Named Entities')
  })

  it('should NOT display the named entities tab in SERVER mode', async () => {
    const id = 'foo.txt'
    Murmur.config.merge({ mode: 'SERVER' })
    const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(3)
    expect(wrapper.findAll('.document .document__header__nav__item').at(1).text()).not.toContain('Named Entities')
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
