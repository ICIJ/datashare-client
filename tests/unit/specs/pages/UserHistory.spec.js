import { shallowMount, mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import UserHistory from '@/pages/UserHistory'

describe('UserHistory.vue', () => {
  const routes = [
    {
      name: 'user-history',
      path: '/user-history',
      children: [
        { name: 'user-history.document.list', path: 'document' },
        { name: 'user-history.saved-search.list', path: 'search' }
      ]
    }
  ]

  let api, core

  beforeEach(() => {
    api = {
      getUserHistory: vi.fn(),
      deleteUserHistory: vi.fn()
    }
    core = CoreSetup.init(api).useAll().useRouter(routes)
  })

  it('should load the history page', async () => {
    await core.router.replace({ name: 'user-history' })
    const wrapper = shallowMount(UserHistory, { global: { plugins: core.plugins } })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })

  it('should load the document history page by default', async () => {
    await core.router.replace({ name: 'user-history' })
    const wrapper = mount(UserHistory, { global: { plugins: core.plugins } })
    await flushPromises()
    expect(wrapper.vm.$route.name).toBe('user-history.document.list')
  })

  it('should call get user history when page is loaded', async () => {
    await core.router.replace({ name: 'user-history.document.list' })
    shallowMount(UserHistory, { global: { plugins: core.plugins } })
    await flushPromises()
    expect(api.getUserHistory).toBeCalledWith('document', 0, 100, undefined, undefined, undefined)
  })

  it('should call delete user history api function is called', async () => {
    await core.router.replace({ name: 'user-history.document.list' })
    const wrapper = shallowMount(UserHistory, { global: { plugins: core.plugins } })
    await wrapper.vm.deleteUserHistory()
    await flushPromises()
    expect(api.deleteUserHistory).toBeCalledWith('document')
  })
})
