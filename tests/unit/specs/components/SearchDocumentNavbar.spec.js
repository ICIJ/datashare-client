import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { getOS } from '@/utils/utils'
import { App } from '@/main'

jest.mock('@/utils/utils', () => {
  return {
    getOS: jest.fn(),
    getShortkeyOS: jest.fn(),
    isAuthenticated: jest.fn()
  }
})

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('SearchDocumentNavbar', () => {
  let wrapper

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  beforeEach(() => {
    wrapper = shallowMount(SearchDocumentNavbar, { localVue, router, store, mocks: { $t: msg => msg } })
    getOS.mockReset()
  })

  afterAll(() => jest.unmock('@/utils/utils'))

  it('should display a "Back to the search results" link', () => {
    expect(wrapper.find('.search-document-navbar__back').exists()).toBeTruthy()
  })

  it('should return the tooltip for mac', () => {
    getOS.mockImplementation(() => 'mac')

    expect(wrapper.vm.previousTooltip).toBe('search.nav.previous.tooltipMac')
  })

  it('should return the tooltip for NOT mac', () => {
    getOS.mockImplementation(() => 'default')

    expect(wrapper.vm.previousTooltip).toBe('search.nav.previous.tooltipOthers')
  })
})
