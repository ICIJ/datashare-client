import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { jsonOk } from 'tests/unit/tests_utils'

import DocumentActions from '@/components/DocumentActions'
import esClient from '@/api/esClient'
import Response from '@/api/Response'
import store from '@/store'
import { datashare } from '@/store/modules/search'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(BootstrapVue)

describe('DocumentActions', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(async () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    // Remove all stared docs
    store.commit('search/starredDocuments', [])
    // Create a dummy document with id "doc_01"
    await letData(es).have(new IndexedDocument('doc_01')).commit()
    const document = Response.instantiate(await esClient.getEsDoc(process.env.VUE_APP_ES_INDEX, 'doc_01'))
    wrapper = shallowMount(DocumentActions, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
  })

  it('should display a filled star if document is starred, an empty one otherwise', async () => {
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')
    store.commit('search/starredDocuments', ['doc_01'])

    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')
  })

  it('should replace an empty star by a filled one on click on it', async () => {
    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual(['doc_01'])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')
  })

  it('should replace a filled star by an empty one on click on it', async () => {
    store.commit('search/pushFromStarredDocuments', 'doc_01')

    expect(wrapper.vm.starredDocuments).toEqual(['doc_01'])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('fa,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toEqual('far,star')
  })

  it('should raise an "facet::starred:refresh" event when adding a star', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::starred:refresh', mockCallback)

    await wrapper.vm.toggleStarDocument(wrapper.vm.document)
    await wrapper.vm.$nextTick()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})
