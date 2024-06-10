import { shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import DocumentNavbar from '@/components/document/DocumentNavbar'
import CoreSetup from '~tests/unit/CoreSetup'

vi.mock('@/utils/utils')

describe('DocumentNavbar.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, api, wrapper

  beforeAll(() => {
    api = {
      setMarkAsRecommended: vi.fn(),
      setUnmarkAsRecommended: vi.fn(),
      getRecommendationsByProject: vi.fn(),
      elasticsearch: es
    }
    core = CoreSetup.init(api).useAll()
    core.core.store.commit('search/index', index)
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    vi.clearAllMocks()
    const computed = { ...DocumentNavbar.computed, isServer: () => true }
    const { plugins } = core
    wrapper = shallowMount(DocumentNavbar, { global: { plugins }, computed })
  })

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    vi.unmock('@/utils/utils')
  })

  describe('Mark as recommended button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await core.store.dispatch('document/get', { id: 'doc_01', index })
    })
    beforeEach(() => {
      api.getRecommendationsByProject.mockClear()
    })

    it('should display a "Mark as recommended" button', () => {
      expect(wrapper.find('.document-navbar__recommended-by').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function, MARK document as recommended and update recommendedBy in search store', async () => {
      api.getRecommendationsByProject.mockResolvedValueOnce({ aggregates: [{ item: { id: 'Jean-Michel' }, count: 1 }] })
      await wrapper.vm.toggleAsRecommended()

      expect(api.setMarkAsRecommended).toBeCalledTimes(1)
      expect(api.setMarkAsRecommended).toBeCalledWith(index, ['doc_01'])

      expect(wrapper.vm.isRecommended).toBeTruthy()
      expect(api.getRecommendationsByProject).toBeCalledWith(index)

      expect(core.store.state.recommended.byUsers).toEqual([{ user: 'Jean-Michel', count: 1 }])
    })

    it('should call batchUpdate api function, UNMARK document as recommended and update recommendedBy in search store', async () => {
      core.store.commit('document/isRecommended', true)

      await wrapper.vm.toggleAsRecommended()

      expect(wrapper.vm.isRecommended).toBeFalsy()
      expect(core.store.state.recommended.byUsers).toEqual([])

      expect(api.setUnmarkAsRecommended).toBeCalledTimes(1)
      expect(api.setUnmarkAsRecommended).toBeCalledWith(index, ['doc_01'])
      expect(api.getRecommendationsByProject).toBeCalledTimes(1)
      expect(api.getRecommendationsByProject).toBeCalledWith(index)
    })
  })

  it('should display the number of recommendedBy', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await core.store.dispatch('document/get', { id: 'doc_01', index })

    expect(wrapper.find('.document-navbar__recommended-by-number').exists()).toBeTruthy()
  })

  it('should display document title if shrinked', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await core.store.dispatch('document/get', { id: 'doc_01', index })

    await wrapper.setProps({ isShrinked: true })

    expect(wrapper.find('.document-navbar__title').exists()).toBeTruthy()
  })
})
