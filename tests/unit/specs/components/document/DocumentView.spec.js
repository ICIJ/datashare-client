import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'

import { createLocalVue, mount, shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import DocumentView from '@/components/document/DocumentView'
import trim from 'lodash/trim'
import { createServer } from 'http-server'
import { EventBus } from '@/utils/event-bus.js'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages }, silentTranslationWarn: true })

describe('DocumentView.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer = null

  beforeAll(() => {
    httpServer = createServer({root: 'tests/unit/resources'})
    httpServer.listen(9876)
  })

  afterEach(async () => {
    store.commit('document/reset')
  })

  afterAll(() => {
    httpServer.close()
  })

  it('should display an error message when document is not found', async () => {
    const id = 'notfound'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('span').textContent).toEqual('Document not found')
  })

  it('should display a document', async () => {
    const id = 'foo.txt'
    const wrapped = shallowMount(DocumentView, {localVue, i18n, router, store, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('h3 > span').textContent).toEqual(id)
    expect(wrapped.vm.$el.querySelectorAll('dd')[2].textContent).toEqual(id)
  })

  it('should display a child document', async () => {
    const id = 'child.txt'
    const routing = 'parent.txt'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id, routing }})

    await letData(es).have(new IndexedDocument(routing)
      .withContent('this is a parent document'))
      .commit()
    await letData(es).have(new IndexedDocument(id)
      .withContent('this is a children document')
      .withParent(routing))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('h3 > span').textContent).toEqual(id)
  })

  it('should mark named entities', async () => {
    const id = 'mydoc.txt'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a NER doc with 2 NER2')
      .withNer('NER', 2, 'CATEGORY1')
      .withNer('NER2', 17, 'CATEGORY2'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('mark').length).toEqual(2)
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].textContent).toEqual('NER')
    expect(wrapped.vm.$el.querySelectorAll('mark')[0].classList.contains('bg-category-category1')).toEqual(true)
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].textContent).toEqual('NER2')
    expect(wrapped.vm.$el.querySelectorAll('mark')[1].classList.contains('bg-category-category2')).toEqual(true)
  })

  it('should display a document with named entities and escaped HTML', async () => {
    const id = 'html_doc.txt'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withNer('foo', 2))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.text-pre-wrap').innerHTML).toEqual(
      'a <mark class="ner bg-category-person">foo</mark> document &lt;with&gt;HTML&lt;/with&gt;')
  })

  it('should display named entities in the dedicated tab', async () => {
    const id = 'html_doc.txt'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withPipeline('CORENLP')
      .withNer('mention_01', 2, 'CATEGORY_01')
      .withNer('mention_02', 5, 'CATEGORY_02')
      .withNer('mention_03', 12, 'CATEGORY_03'))
      .commit()
    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    const pills = wrapped.vm.$el.querySelectorAll('.document__named-entities .badge-pill')

    expect(pills.length).toEqual(3)
    expect(trim(pills[0].querySelector('span:first-child').textContent)).toEqual('mention_01')
    expect(pills[0].classList.contains('border-category-category_01')).toEqual(true)
    expect(trim(pills[1].querySelector('span:first-child').textContent)).toEqual('mention_02')
    expect(pills[1].classList.contains('border-category-category_02')).toEqual(true)
    expect(trim(pills[2].querySelector('span:first-child').textContent)).toEqual('mention_03')
    expect(pills[2].classList.contains('border-category-category_03')).toEqual(true)
  })

  it('should call the SpreadsheetViewer for XLSX document', async () => {
    const id = 'spreadsheet.xlsx'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.spreadsheet-viewer')).not.toEqual(null)
  })

  it('should call the SpreadsheetViewer for CSV document', async () => {
    const id = 'spreadsheet.csv'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('text/csv'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelector('.spreadsheet-viewer')).not.toEqual(null)
  })

  // it('should call the PdfViewer for PDF document', async () => {
  //   const id = 'document.pdf'
  //   const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})
  //
  //   await letData(es).have(new IndexedDocument(id)
  //     .withContent('')
  //     .withContentType('application/pdf'))
  //     .commit()
  //
  //   await wrapped.vm.getDoc()
  //   await wrapped.vm.$nextTick()
  //
  //   expect(wrapped.vm.$el.querySelector('.pdf-viewer')).not.toEqual(null)
  // })

  // it('should call the TiffViewer for TIFF document', async () => {
  //   const id = 'image.tiff'
  //   const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})
  //
  //   await letData(es).have(new IndexedDocument(id)
  //     .withContent('')
  //     .withContentType('image/tiff'))
  //     .commit()
  //
  //   await wrapped.vm.getDoc()
  //   await wrapped.vm.$nextTick()
  //
  //   expect(wrapped.vm.$el.querySelector('.tiff-viewer')).not.toEqual(null)
  // })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    const id = 'test.doc'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent(''))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.document .tab-pane.document__named-entities .document__named-entities--not--searched').length).toEqual(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    const id = 'test.doc'
    const wrapped = mount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withPipeline('CORENLP'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.document .tab-pane.document__named-entities .document__named-entities--not--found').length).toEqual(1)
  })

  it('should reload the named entities search on custom event emitted', async () => {
    const id = 'mydoc.txt'
    const wrapped = shallowMount(DocumentView, {i18n, router, store, localVue, propsData: { id }})

    let indexBuilder = await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withPipeline('CORENLP')
      .withNer('mention_01', 2, 'CATEGORY_01')
      .withNer('mention_02', 5, 'CATEGORY_02'))
      .commit()

    await wrapped.vm.getDoc()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.document__named-entities .badge-pill').length).toEqual(2)

    await indexBuilder.hideNer('mention_02')
    EventBus.$emit('facet::hide::named-entities')
    await delay(100)
    expect(wrapped.vm.$el.querySelectorAll('.document__named-entities .badge-pill').length).toEqual(1)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
