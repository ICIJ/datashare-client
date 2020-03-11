import axios from 'axios'
import Murmur from '@icij/murmur'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import Api from '@/api'
import { Core } from '@/core'
import DocumentView from '@/pages/DocumentView'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: [{ label: 'tag', user: { id: 'local' }, creationDate: '2019-09-29T21:57:57.565+0000' }] })
  }
})

const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('DocumentView.vue', () => {
  const index = toLower('DocumentView')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'
  let wrapper

  beforeEach(() => letData(es).have(new IndexedDocument(id, index)).commit())

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
  })

  it('should display an error message if document is not found', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id: 'notfound', index } })
    await wrapper.vm.getDoc()

    expect(wrapper.find('span').text()).toEqual('Document not found')
  })

  it('should call to the API to retrieve tags', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })
    await wrapper.vm.getDoc()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl(`/api/${index}/documents/tags/${id}`) })
  })

  it('should display a document', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })
    await wrapper.vm.getDoc()

    expect(wrapper.contains('.document__header')).toBeTruthy()
  })

  it('should display tags', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })

    await wrapper.vm.getDoc()

    expect(wrapper.contains('document-tags-form-stub')).toBeTruthy()
  })

  it('should display the named entities tab', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null, manageDocuments: true })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(4)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).text()).toContain('Named Entities')
  })

  it('should NOT display the named entities tab', async () => {
    Murmur.config.merge({ manageDocuments: false })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(3)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).text()).not.toContain('Named Entities')
  })

  describe('navigate through tabs as loop', () => {
    beforeEach(async () => {
      wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData: { id, index } })
      await wrapper.vm.getDoc()
    })
    it('should set the previous tab as active', () => {
      wrapper.vm.activeTab = 'details'
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })

    it('should set the next tab as active', () => {
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('details')
    })

    it('should set the last tab as active', () => {
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('preview')
    })

    it('should set the first tab as active', () => {
      wrapper.vm.activeTab = 'preview'
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })
  })
})
