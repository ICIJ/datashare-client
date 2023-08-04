import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { flushPromises } from 'tests/unit/tests_utils'

import { Core } from '@/core'
import UserHistory from '@/pages/UserHistory'

describe('UserHistory.vue', () => {
  let i18n, localVue, store, wait, router
  let api
  let wrapper = null

  beforeAll(() => {
    api = {
      getUserHistory: jest.fn(),
      deleteUserHistory: jest.fn()
    }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    jest.clearAllMocks()
    router = new VueRouter({
      routes: [
        {
          name: 'user-history',
          path: '/user-history',
          children: [
            { name: 'user-history.document.list', path: 'document' },
            { name: 'user-history.saved-search.list', path: 'search' }
          ]
        }
      ]
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should load the history page', async () => {
    await router.replace({ name: 'user-history' })
    wrapper = shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })

  it('should load the document history page by default', async () => {
    await router.replace({ name: 'user-history' })
    wrapper = mount(UserHistory, { i18n, localVue, router, store, wait })
    await flushPromises()
    expect(wrapper.vm.$route.name).toBe('user-history.document.list')
  })

  it('should call get user history when page is loaded', async () => {
    await router.replace({ name: 'user-history.document.list' })
    wrapper = shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    await wrapper.vm.$nextTick()
    expect(api.getUserHistory).toBeCalledTimes(1)
    expect(api.getUserHistory).toBeCalledWith('document', 0, 100, undefined, undefined, undefined)
  })

  it('should call delete user history api function is called', async () => {
    await router.replace({ name: 'user-history.document.list' })
    wrapper = shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    await wrapper.vm.deleteUserHistory()
    await wrapper.vm.$nextTick()

    expect(api.deleteUserHistory).toBeCalledTimes(1)
    expect(api.deleteUserHistory).toBeCalledWith('document')
  })
})
