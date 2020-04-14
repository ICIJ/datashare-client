import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { Core } from '@/core'
import { getShortkeyOS } from '@/utils/utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/utils/utils')
jest.mock('axios')

const { i18n, localVue, store, router } = Core.init(createLocalVue()).useAll()

describe('SearchDocumentNavbar.vue', () => {
  const project = toLower('SearchDocumentNavbar')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    store.commit('search/index', project)
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const computed = { isServer: () => true }
    wrapper = shallowMount(SearchDocumentNavbar, { i18n, localVue, store, router, computed })
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    jest.unmock('@/utils/utils')
    jest.unmock('axios')
  })

  it('should display a "Back to the search results" link', () => {
    expect(wrapper.find('.search-document-navbar__back').exists()).toBeTruthy()
  })

  it('should return the tooltip for mac', () => {
    getShortkeyOS.mockReturnValueOnce('mac')

    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>⌘</kbd> + <kbd>←</kbd>)')
  })

  it('should return the tooltip for NOT mac', () => {
    getShortkeyOS.mockReturnValueOnce('default')

    expect(wrapper.vm.previousTooltip).toBe('Previous document (<kbd>ctrl</kbd> + <kbd>←</kbd>)')
  })

  describe('Mark as recommmended button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', project)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index: project })
    })

    it('should display a "Mark as recommmended" button', () => {
      expect(wrapper.find('.search-document-navbar__recommended-by').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function, MARK document as recommended and update recommendedBy in search store', async () => {
      axios.request.mockClear()
      axios.request.mockResolvedValue({ data: [{ id: 'Jean-Michel' }] })
      await wrapper.vm.toggleAsRecommended()

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/recommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRecommended).toBeTruthy()
      expect(axios.request).toBeCalledWith({ url: Api.getFullUrl(`/api/users/recommendations?project=${project}`) })
      expect(store.state.search.recommendedByUsers).toEqual(['Jean-Michel'])
    })

    it('should call batchUpdate api function, UNMARK document as recommended and update recommendedBy in search store', async () => {
      store.commit('document/isRecommended', true)
      axios.request.mockClear()
      axios.request.mockResolvedValue({ data: [] })

      await wrapper.vm.toggleAsRecommended()

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${project}/documents/batchUpdate/unrecommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRecommended).toBeFalsy()
      expect(axios.request).toBeCalledWith({ url: Api.getFullUrl(`/api/users/recommendations?project=${project}`) })
      expect(store.state.search.recommendedByUsers).toEqual([])
    })
  })

  it('should display the number of recommendedBy', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index: project })

    expect(wrapper.find('.search-document-navbar__recommended-by-number').exists()).toBeTruthy()
  })

  it('should display document title if shrinked', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index: project })

    await wrapper.setProps({ isShrinked: true })

    expect(wrapper.find('.search-document-navbar__title').exists()).toBeTruthy()
    expect(wrapper.find('.search-document-navbar__title').text()).toBe('doc_01')
  })
})
