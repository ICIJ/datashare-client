import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import VueProgressBar from 'vue-progressbar'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import DocumentView from '@/pages/DocumentView'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.use(VueProgressBar)
localVue.directive('shortkey', VueShortkey)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

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

  it('should display an error message if document is not found', async () => {
    const id = 'notfound'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await wrapper.vm.getDoc()

    expect(wrapper.find('span').text()).toEqual('Document not found')
  })

  it('should display a document', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    const id = 'foo.txt'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.contains('.document__header')).toBeTruthy()
  })

  it('should call the SpreadsheetViewer component for XLSX document', async () => {
    const id = 'spreadsheet.xlsx'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commit()

    await wrapper.vm.getDoc()
    wrapper.vm.activateTab('preview')

    expect(wrapper.contains('.spreadsheet-viewer')).toBeTruthy()
  })

  it('should call the SpreadsheetViewer component for CSV document', async () => {
    const id = 'spreadsheet.csv'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('text/csv'))
      .commit()

    await wrapper.vm.getDoc()
    wrapper.vm.activateTab('preview')

    expect(wrapper.contains('.spreadsheet-viewer')).toBeTruthy()
  })

  it('should call the PdfViewer component for PDF document', async () => {
    const id = 'document.pdf'
    const wrapper = mount(DocumentView, { localVue, i18n, router, store, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/pdf'))
      .commit()

    wrapper.vm.activateTab('preview')
    await wrapper.vm.getDoc()

    expect(wrapper.contains('.pdf-viewer')).toBeTruthy()
  })

  it('should call the TiffViewer component for TIFF document', async () => {
    const id = 'image.tiff'
    const wrapper = mount(DocumentView, { localVue, i18n, router, store, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('image/tiff'))
      .commit()

    await wrapper.vm.getDoc()
    wrapper.vm.activateTab('preview')

    expect(wrapper.contains('.tiff-viewer')).toBeTruthy()
  })

  it('should display the named entities tab in LOCAL mode', async () => {
    const id = 'doc.txt'
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(4)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).text()).toContain('Named Entities')
  })

  it('should NOT display the named entities tab in SERVER mode', async () => {
    const id = 'doc.txt'
    Murmur.config.merge({ mode: 'SERVER' })
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(3)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).text()).not.toContain('Named Entities')
  })

  describe('navigate through tasb as loop', () => {
    it('should set the previous tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.activeTab = 'details'
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })

    it('should set the next tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('details')
    })

    it('should set the last tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('preview')
    })

    it('should set the first tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.activeTab = 'preview'
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })
  })
})
