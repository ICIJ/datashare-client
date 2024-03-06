import { createLocalVue, shallowMount } from '@vue/test-utils'
import toLower from 'lodash/toLower'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Core } from '@/core'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'

vi.mock('@/utils/utils')

describe('SearchDocumentNavbar.vue', () => {
  const project = toLower('SearchDocumentNavbar')
  let wrapper, i18n, localVue, store, router

  beforeAll(() => {
    const core = Core.init(createLocalVue()).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    router = core.router
    store.commit('search/index', project)
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const computed = { isServer: () => true }
    wrapper = shallowMount(SearchDocumentNavbar, { i18n, localVue, store, router, computed })
  })

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    vi.unmock('@/utils/utils')
  })

  it('should display a "Back to the search results" link', () => {
    expect(wrapper.find('.document-navbar__back').exists()).toBeTruthy()
  })
})
