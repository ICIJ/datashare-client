import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'
import { removeCookie, setCookie } from 'tiny-cookie'

import Api from '@/api'
import DocumentNavbar from '@/components/document/DocumentNavbar'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/utils/utils')
jest.mock('axios')

describe('DocumentNavbar.vue', () => {
  const { i18n, localVue, store, router } = Core.init(createLocalVue()).useAll()
  const { index, es } = esConnectionHelper.build()
  let wrapper = null

  beforeAll(() => {
    store.commit('search/index', index)
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const computed = { isServer: () => true }
    wrapper = shallowMount(DocumentNavbar, { i18n, localVue, store, router, computed })
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    jest.unmock('@/utils/utils')
    jest.unmock('axios')
  })

  describe('Mark as recommmended button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
    })

    it('should display a "Mark as recommended" button', () => {
      expect(wrapper.find('.document-navbar__recommended-by').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function, MARK document as recommended and update recommendedBy in search store', async () => {
      axios.request.mockClear()
      axios.request.mockResolvedValue({ data: { aggregates: [{ item: { id: 'Jean-Michel' }, count: 1 }] } })
      await wrapper.vm.toggleAsRecommended()

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/recommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRecommended).toBeTruthy()
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/users/recommendations'),
        method: 'GET',
        params: {
          project: index
        }
      }))
      expect(store.state.recommended.byUsers).toEqual([{ user: 'Jean-Michel', count: 1 }])
    })

    it('should call batchUpdate api function, UNMARK document as recommended and update recommendedBy in search store', async () => {
      store.commit('document/isRecommended', true)
      axios.request.mockClear()
      axios.request.mockResolvedValue({ data: [] })

      await wrapper.vm.toggleAsRecommended()

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/unrecommend`),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRecommended).toBeFalsy()
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/users/recommendations'),
        method: 'GET',
        params: {
          project: index
        }
      }))
      expect(store.state.recommended.byUsers).toEqual([])
    })
  })

  it('should display the number of recommendedBy', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    expect(wrapper.find('.document-navbar__recommended-by-number').exists()).toBeTruthy()
  })

  it('should display document title if shrinked', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    await wrapper.setProps({ isShrinked: true })

    expect(wrapper.find('.document-navbar__title').exists()).toBeTruthy()
    expect(wrapper.find('.document-navbar__title').text()).toBe('doc_01')
  })
})
