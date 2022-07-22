import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import elasticsearch from '@/api/elasticsearch'
import { Core } from '@/core'
import DocumentView from '@/pages/DocumentView'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

Api.prototype.getUser = jest.fn().mockResolvedValue({ uid: 'test-user' })

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: [
        { label: 'tag', user: { id: 'local' }, creationDate: '2019-09-29T21:57:57.565+0000' }
      ]
    })
  }
})

describe('DocumentView.vue', () => {
  const core = Core.init(createLocalVue()).useAll()
  const { i18n, localVue, router, store, wait } = core
  const { index: project, es } = esConnectionHelper.build()
  const id = 'document'
  const parentId = 'parent_document'
  const propsData = { index: project, id, routing: parentId }
  let wrapper = null

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument(parentId, project)).commit()
    await letData(es).have(new IndexedDocument(id, project).withParent(parentId)).commit()
    store.commit('document/doc', { _id: id, _index: project, _source: { extractionLevel: 1 } })
  })

  afterEach(() => {
    store.commit('document/reset')
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    axios.request.mockClear()
  })

  afterAll(() => jest.unmock('axios'))

  it('should display an error message if document is not found', async () => {
    const propsData = { id: 'notfound', index: project }
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    expect(wrapper.find('span').text()).toBe('Document not found')
  })

  it('should call the elasticsearch to retrieve document parent', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })
    const spyElasticsearchGet = jest.spyOn(elasticsearch, 'get')
    await wrapper.vm.getDoc()
    const payload = { index: project, id: parentId, routing: null }
    expect(spyElasticsearchGet).toBeCalledWith(expect.objectContaining(payload))
  })

  it('should call the API to retrieve document tags', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })
    await wrapper.vm.getDoc()
    const url = Api.getFullUrl(`/api/${project}/documents/tags/${id}`)
    expect(axios.request).toBeCalledWith({ url })
  })

  it('should call the API to retrieve document recommendations', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()
    const url = Api.getFullUrl(`/api/users/recommendationsby?project=${project}&docIds=${id}`)
    expect(axios.request).toBeCalledWith({ url })
  })

  it('should display a document', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    expect(wrapper.find('.document__header').element).toBeTruthy()
  })

  it('should display tags', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    expect(wrapper.find('document-tags-form-stub').element).toBeTruthy()
  })

  it('should display the named entities tab', async () => {
    Murmur.config.merge({ dataDir: null, mountedDataDir: null, manageDocuments: true })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(4)
    expect(wrapper.findAll('.document .document__header__nav__item').at(3).attributes('title'))
      .toContain('Named Entities')
  })

  it('should NOT display the named entities tab', async () => {
    Murmur.config.merge({ manageDocuments: false })
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    expect(wrapper.findAll('.document .document__header__nav__item')).toHaveLength(3)
    expect(wrapper.findAll('.document .document__header__nav__item').at(2).attributes('title'))
      .not.toContain('Named Entities')
  })

  it('should call the API to add document to history', async () => {
    wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })

    await wrapper.vm.getDoc()

    const url = Api.getFullUrl('/api/users/me/history')
    expect(axios.request).toBeCalledWith(expect.objectContaining({ url }))
  })

  describe('navigate through tabs as loop', () => {
    beforeEach(async () => {
      wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })
      await wrapper.vm.getDoc()
    })

    it('should set the previous tab as active', () => {
      wrapper.vm.$set(wrapper.vm, 'activeTab', 'preview')
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })

    it('should set the next tab as active', () => {
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('preview')
    })

    it('should set the last tab as active', () => {
      wrapper.vm.goToPreviousTab()

      expect(wrapper.vm.activeTab).toBe('details')
    })

    it('should set the first tab as active', () => {
      wrapper.vm.$set(wrapper.vm, 'activeTab', 'details')
      wrapper.vm.goToNextTab()

      expect(wrapper.vm.activeTab).toBe('extracted-text')
    })
  })

  describe('transform the tabs array through a pipeline', () => {
    const temporaryPipelineName = 'document-view-tabs-add-tmp-tab'

    beforeEach(async () => {
      core.registerPipeline({
        name: temporaryPipelineName,
        category: 'document-view-tabs',
        type (tabs, document) {
          const tab = { name: 'tmp', label: 'Temporary' }
          return [...tabs, tab]
        }
      })
      wrapper = shallowMount(DocumentView, { i18n, localVue, router, store, wait, propsData })
      await wrapper.vm.getDoc()
    })

    afterEach(() => {
      core.unregisterPipeline(temporaryPipelineName)
    })

    it('should add a tab using the `document-view-tabs` pipeline', () => {
      const lastTab = wrapper.vm.tabsThoughtPipeline[wrapper.vm.tabsThoughtPipeline.length - 1]
      expect(lastTab.label).toBe('Temporary')
    })

    it('should add a tab with a `labelComponent` property', () => {
      const lastTab = wrapper.vm.tabsThoughtPipeline[wrapper.vm.tabsThoughtPipeline.length - 1]
      expect(lastTab.labelComponent).toHaveProperty('template')
    })

    it('should add a tab with a `labelComponent` within the label in its template', () => {
      const lastTab = wrapper.vm.tabsThoughtPipeline[wrapper.vm.tabsThoughtPipeline.length - 1]
      const lastTabWrapper = shallowMount(lastTab.labelComponent, { i18n, localVue })
      expect(lastTabWrapper.text()).toBe('Temporary')
    })
  })
})
