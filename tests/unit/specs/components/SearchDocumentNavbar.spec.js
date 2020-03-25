import toLower from 'lodash/toLower'
import axios from 'axios'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import Api from '@/api'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { Core } from '@/core'
import { getShortkeyOS } from '@/utils/utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/utils/utils')

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: { uid: 'Jean-Michel' } })
  }
})

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('SearchDocumentNavbar.vue', () => {
  const index = toLower('SearchDocumentNavbar')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = shallowMount(SearchDocumentNavbar, { i18n, localVue, store })
  })

  afterAll(() => {
    jest.unmock('axios')
    jest.unmock('@/utils/utils')
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

  describe('Mark as read button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
    })

    it('should display a "Mark as read" button', () => {
      expect(wrapper.find('.search-document-navbar__readBy').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function and mark document as READ', async () => {
      await wrapper.vm.toggleAsRead()

      expect(axios.request).toBeCalledTimes(2)
      expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/users/me') })
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/searchdocumentnavbar/documents/batchUpdate/markRead'),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRead).toBeTruthy()
    })

    it('should call batchUpdate api function and mark document as UNREAD', async () => {
      store.commit('document/isRead', true)
      axios.request.mockClear()

      await wrapper.vm.toggleAsRead()

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/searchdocumentnavbar/documents/batchUpdate/unmarkRead'),
        method: 'POST',
        data: ['doc_01']
      }))
      expect(wrapper.vm.isRead).toBeFalsy()
    })
  })

  it('should display the number of readBy', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    expect(wrapper.find('.search-document-navbar__numberOfReadBy').exists()).toBeTruthy()
  })

  it('should display document title if shrinked', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    await wrapper.setProps({ isShrinked: true })

    expect(wrapper.find('.search-document-navbar > div.flex-grow-1 > b-btn-stub').exists()).toBeTruthy()
    expect(wrapper.find('.search-document-navbar > div.flex-grow-1 > b-btn-stub').text()).toBe('doc_01')
  })
})
