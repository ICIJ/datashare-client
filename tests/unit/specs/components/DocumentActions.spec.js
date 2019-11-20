import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Murmur from '@icij/murmur'

import { App } from '@/main'
import { datashare } from '@/store/modules/search'
import DocumentActions from '@/components/DocumentActions'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonOk } from 'tests/unit/tests_utils'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('DocumentActions.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let document, wrapper

  beforeAll(() => Murmur.config.merge({ userProjects: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(async () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    store.commit('search/starredDocuments', [])
    document = await letData(es).have(new IndexedDocument()).commit()
    wrapper = shallowMount(DocumentActions, { localVue, store, propsData: { document }, mocks: { $t: msg => msg }, sync: false })
  })

  it('should display a filled star if document is starred, an empty one otherwise', async () => {
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')
    store.commit('search/starredDocuments', [document.id])
    await flushPromises()
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')
  })

  it('should replace an empty star by a filled one on click on it', async () => {
    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual([document.id])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')
  })

  it('should replace a filled star by an empty one on click on it', async () => {
    store.commit('search/pushFromStarredDocuments', document.id)
    await flushPromises()

    expect(wrapper.vm.starredDocuments).toEqual([document.id])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')
  })

  it('should raise an "facet::starred::refresh" event when adding a star', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::starred::refresh', mockCallback)

    await wrapper.vm.toggleStarDocument(wrapper.vm.document)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not display "Download" button if download is not allowed', () => {
    expect(wrapper.find('.document-actions__download').exists()).toBeFalsy()
  })

  it('should display "Download" button if download is allowed', () => {
    wrapper = shallowMount(DocumentActions, { localVue, store, propsData: { document, isDownloadAllowed: true }, mocks: { $t: msg => msg }, sync: false })
    expect(wrapper.find('.document-actions__download').exists()).toBeTruthy()
  })
})
