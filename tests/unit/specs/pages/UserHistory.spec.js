import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'
import axios from 'axios'
import VueRouter from 'vue-router'

import Api from '@/api'
import UserHistory from '@/pages/UserHistory'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: [{
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
      }, {
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
      }]
    })
  }
})

describe('UserHistory.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  const router = new VueRouter({
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

  afterEach(() => axios.request.mockClear())

  afterAll(() => jest.unmock('axios'))

  it('should load the history page', async () => {
    await router.replace({ name: 'user-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router })
    expect(wrapper.find('page-header-stub').exists()).toBeTruthy()
  })

  it('should call get user history when page is loaded', async () => {
    await router.replace({ name: 'document-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/users/me/history') })
  })

  it('should call delete user history api function is called with search', async () => {
    await router.replace({ name: 'search-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router })

    wrapper.vm.deleteUserHistory()

    expect(axios.request).toBeCalledTimes(2)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/me/history?type=search'),
      method: 'DELETE'
    }))
  })

  it('should call delete user history api function is called with document', async () => {
    await router.replace({ name: 'document-history' })
    wrapper = await shallowMount(UserHistory, { i18n, localVue, router })

    wrapper.vm.deleteUserHistory()

    expect(axios.request).toBeCalledTimes(2)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/me/history?type=document'),
      method: 'DELETE'
    }))
  })
})
