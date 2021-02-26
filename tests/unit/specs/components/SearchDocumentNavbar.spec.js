import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import { Core } from '@/core'

jest.mock('@/utils/utils')
jest.mock('axios')

describe('SearchDocumentNavbar.vue', () => {
  const { i18n, localVue, store, router } = Core.init(createLocalVue()).useAll()
  const project = toLower('SearchDocumentNavbar')
  let wrapper = null

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
    jest.unmock('axios')
  })

  it('should display a "Back to the search results" link', () => {
    expect(wrapper.find('.document-navbar__back').exists()).toBeTruthy()
  })
})
