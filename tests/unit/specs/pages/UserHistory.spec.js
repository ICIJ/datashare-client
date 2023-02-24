import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { Api } from '@/api'
import { Core } from '@/core'
import UserHistory from '@/pages/UserHistory'
import { flushPromises } from 'tests/unit/tests_utils'

describe('UserHistory.vue', () => {
  let i18n, localVue, store, wait, router
  let wrapper = null
  let mockAxios

  beforeAll(() => {
    mockAxios = { request: jest.fn() }

    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockAxios.request.mockResolvedValue({
      data: [
        {
          id: 'id_01',
          user: {
            id: 'user',
            name: null,
            email: null,
            provider: 'local'
          },
          creationDate: 'creation_date_01',
          modificationDate: 'modification_date_01',
          type: 'DOCUMENT',
          name: 'name_01',
          uri: 'uri_01'
        },
        {
          id: 'id_02',
          user: {
            id: 'user',
            name: null,
            email: null,
            provider: 'local'
          },
          creationDate: 'creation_date_02',
          modificationDate: 'modification_date_02',
          type: 'SEARCH',
          name: 'name_02',
          uri: 'uri_02'
        }
      ]
    })

    router = new VueRouter({
      routes: [
        {
          name: 'user-history',
          path: '/user-history',
          children: [
            { name: 'document-history', path: 'document' },
            { name: 'search-history', path: 'search' }
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
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })

  it('should load the document history page by default', async () => {
    await router.replace({ name: 'user-history' })
    wrapper = await mount(UserHistory, { i18n, localVue, router, store, wait })
    await flushPromises()
    expect(wrapper.vm.$route.name).toBe('document-history')
  })

  it('should call get user history when page is loaded', async () => {
    await router.replace({ name: 'document-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    await wrapper.vm.$nextTick()
    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/users/me/history'),
        method: 'GET',
        params: {
          from: 0,
          size: 100,
          type: 'document',
          project: undefined,
          desc: true,
          sort: 'modification_date'
        }
      })
    )
  })

  it('should call delete user history api function is called', async () => {
    await router.replace({ name: 'document-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router, store, wait })
    await wrapper.vm.deleteUserHistory()
    await wrapper.vm.$nextTick()

    expect(mockAxios.request).toBeCalledTimes(2)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/users/me/history'),
        method: 'DELETE',
        params: {
          type: 'document'
        }
      })
    )
  })
})
