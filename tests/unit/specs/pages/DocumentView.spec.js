import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import Murmur from '@icij/murmur'

import { App } from '@/main'
import DocumentView from '@/pages/DocumentView'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const { localVue, i18n, store, router } = App.init(createLocalVue()).useAll()

describe('DocumentView.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const index = process.env.VUE_APP_ES_INDEX
  let httpServer

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
  })

  afterAll(() => httpServer.close())

  it('should display an error message if document is not found', async () => {
    const id = 'notfound'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })

    await wrapper.vm.getDoc()

    expect(wrapper.find('span').text()).toEqual('Document not found')
  })

  it('should display a document', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    const id = 'foo.txt'
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.contains('.document__header')).toBeTruthy()
  })

  it('should display the named entities tab', async () => {
    const id = 'doc.txt'
    Murmur.config.merge({ dataDir: null, mountedDataDir: null, manageDocuments: true })
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('this is foo document'))
      .commit()
    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(4)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).text()).toContain('Named Entities')
  })

  it('should NOT display the named entities tab', async () => {
    const id = 'doc.txt'
    Murmur.config.merge({ manageDocuments: false })
    const wrapper = mount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })

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
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.activeTab = 'details'
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })

    it('should set the next tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('details')
    })

    it('should set the last tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('preview')
    })

    it('should set the first tab as active', async () => {
      const id = 'document'
      const wrapper = shallowMount(DocumentView, { localVue, i18n, store, router, propsData: { id, index } })
      await letData(es).have(new IndexedDocument(id)).commit()
      await wrapper.vm.getDoc()

      wrapper.vm.activeTab = 'preview'
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })
  })
})
