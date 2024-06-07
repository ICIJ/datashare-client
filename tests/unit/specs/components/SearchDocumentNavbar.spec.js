import { mount } from '@vue/test-utils'
import toLower from 'lodash/toLower'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'

vi.mock('@/utils/utils')

describe('SearchDocumentNavbar.vue', () => {
  const project = toLower('SearchDocumentNavbar')
  let wrapper, core

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouter()
    core.store.commit('search/index', project)
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    wrapper = mount(SearchDocumentNavbar, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    vi.unmock('@/utils/utils')
  })

  it('should display a "Back to the search results" link', () => {
    expect(wrapper.find('.document-navbar__back').exists()).toBeTruthy()
  })
})
