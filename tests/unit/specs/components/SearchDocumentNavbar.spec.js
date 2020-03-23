import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import { getShortkeyOS } from '@/utils/utils'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import axios from 'axios'
import Api from '@/api'

jest.mock('@/utils/utils')

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('SearchDocumentNavbar.vue', () => {
  const index = toLower('SearchDocumentNavbar')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = shallowMount(SearchDocumentNavbar, { localVue, store, mocks: { $t: msg => msg } })
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

    expect(wrapper.vm.previousTooltip).toBe('search.nav.previous.tooltipMac')
  })

  it('should return the tooltip for NOT mac', () => {
    getShortkeyOS.mockReturnValueOnce('default')

    expect(wrapper.vm.previousTooltip).toBe('search.nav.previous.tooltipOthers')
  })

  describe('Mark as read button', () => {
    beforeAll(async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)).commit()
      await store.dispatch('document/get', { id: 'doc_01', index })
    })

    it('should display a "Mark as read" button', () => {
      expect(wrapper.find('.search-document-navbar__readBy').exists()).toBeTruthy()
    })

    it('should call batchUpdate api function', async () => {
      await wrapper.vm.toggleAsRead()

      expect(axios.request).toBeCalledTimes(1)
      expect(axios.request).toBeCalledWith(expect.objectContaining({
        url: Api.getFullUrl('/api/searchdocumentnavbar/documents/batchUpdate/markRead'),
        method: 'POST',
        data: { docIds: ['doc_01'] }
      }))
    })
  })

  it('should display the number of readBy', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)).commit()
    await store.dispatch('document/get', { id: 'doc_01', index })

    expect(wrapper.find('.search-document-navbar__numberOfReadBy').exists()).toBeTruthy()
  })
})
