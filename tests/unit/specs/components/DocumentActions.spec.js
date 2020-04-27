import toLower from 'lodash/toLower'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import DocumentActions from '@/components/DocumentActions'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentActions.vue', () => {
  const project = toLower('DocumentActions')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let document, wrapper

  beforeAll(() => Murmur.config.merge({ userProjects: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(async () => {
    store.commit('search/starredDocuments', [])
    document = await letData(es).have(new IndexedDocument('document', project)).commit()
    wrapper = shallowMount(DocumentActions, { i18n, localVue, store, propsData: { document }, sync: false })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a filled star if document is starred, an empty one otherwise', async () => {
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')
    await store.commit('search/starredDocuments', [document.id])

    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace an empty star by a filled one on click on it', async () => {
    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual([document.id])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')
  })

  it('should replace a filled star by an empty one on click on it', async () => {
    await store.commit('search/pushFromStarredDocuments', document.id)

    expect(wrapper.vm.starredDocuments).toEqual([document.id])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('fa,star')

    await wrapper.vm.toggleStarDocument(wrapper.vm.document.id)

    expect(wrapper.vm.starredDocuments).toEqual([])
    expect(wrapper.find('.document-actions__star fa-stub').attributes('icon')).toBe('far,star')
  })

  it('should raise an "filter::starred::refresh" event when adding a star', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::starred::refresh', mockCallback)

    await wrapper.vm.toggleStarDocument(wrapper.vm.document)

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should not display "Download" button if download is not allowed', () => {
    expect(wrapper.find('.document-actions__download').exists()).toBeFalsy()
  })

  it('should display "Download" button if download is allowed', () => {
    wrapper = shallowMount(DocumentActions, { i18n, localVue, store, propsData: { document, isDownloadAllowed: true }, sync: false })
    expect(wrapper.find('.document-actions__download').exists()).toBeTruthy()
  })
})
