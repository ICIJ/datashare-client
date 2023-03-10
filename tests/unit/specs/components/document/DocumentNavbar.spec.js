import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import { Api } from '@/api'
import DocumentNavbar from '@/components/document/DocumentNavbar'
import { Core } from '@/core'

jest.mock('@/utils/utils')

describe('DocumentNavbar.vue', () => {
  let i18n, localVue, store, router, mockAxios, api
  const { index, es } = esConnectionHelper.build()
  let wrapper = null
  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    router = core.router
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
  })

  describe('Mark as recommended button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
    })

    beforeEach(() => {
      mockAxios.request.mockClear()
    })

    it('should display a "Mark as recommended" button', () => {
      expect(wrapper.find('.document-navbar__recommended-by').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function, MARK document as recommended and update recommendedBy in search store', async () => {
      mockAxios.request.mockResolvedValue({ data: { aggregates: [{ item: { id: 'Jean-Michel' }, count: 1 }] } })
      await wrapper.vm.toggleAsRecommended()

      expect(mockAxios.request).toBeCalledTimes(2)
      expect(mockAxios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/recommend`),
          method: 'POST',
          data: ['doc_01']
        })
      )
      expect(wrapper.vm.isRecommended).toBeTruthy()
      expect(mockAxios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/users/recommendations'),
          method: 'GET',
          params: {
            project: index
          }
        })
      )
      expect(store.state.recommended.byUsers).toEqual([{ user: 'Jean-Michel', count: 1 }])
    })

    it('should call batchUpdate api function, UNMARK document as recommended and update recommendedBy in search store', async () => {
      store.commit('document/isRecommended', true)
      mockAxios.request.mockResolvedValue({ data: [] })

      await wrapper.vm.toggleAsRecommended()

      expect(mockAxios.request).toBeCalledTimes(2)
      expect(mockAxios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl(`/api/${index}/documents/batchUpdate/unrecommend`),
          method: 'POST',
          data: ['doc_01']
        })
      )
      expect(wrapper.vm.isRecommended).toBeFalsy()
      expect(mockAxios.request).toBeCalledWith(
        expect.objectContaining({
          url: Api.getFullUrl('/api/users/recommendations'),
          method: 'GET',
          params: {
            project: index
          }
        })
      )
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
