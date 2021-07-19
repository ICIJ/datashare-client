import axios from 'axios'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'

import Api from '@/api'
import UserHistorySearch from '@/pages/UserHistorySearch'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

describe('UserHistorySearch.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  const propsData = {
    events: [{
      id: 'id_01',
      user: {
        id: 'user',
        name: null,
        email: null,
        provider: 'local'
      },
      creationDate: 'creation_date_01',
      modificationDate: 'modification_date_01',
      type: 'SEARCH',
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
  }
  let wrapper = null

  beforeEach(async () => {
    wrapper = await shallowMount(UserHistorySearch, { i18n, localVue, propsData })
  })

  afterAll(() => jest.unmock('axios'))

  it('should NOT display a list of search', async () => {
    const propsData = { events: [] }
    wrapper = await shallowMount(UserHistorySearch, { i18n, localVue, propsData })
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(0)
  })

  it('should display a list of search', async () => {
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(2)
  })

  it('should convert an uri to filters', async () => {
    const uri = '/?q=foo%20AND%20bar&from=0&size=25&sort=relevance&index=project&custom=baz'
    const filters = wrapper.vm.createFiltersFromURI(uri)

    expect(filters).toHaveLength(3)
    expect(filters[0]).toHaveProperty('value', 'foo AND bar')
    expect(filters[1]).toHaveProperty('value', 'project')
    expect(filters[2]).toHaveProperty('value', 'baz')
  })

  it('should call delete user history api function is called', async () => {
    const event = { id: '1', type: 'SEARCH', name: 'name_01', uri: 'uri_01' }

    await wrapper.vm.deleteUserEvent(event)
    await wrapper.vm.$nextTick()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/users/me/history/event?id=1'),
      method: 'DELETE'
    }))
  })
})
