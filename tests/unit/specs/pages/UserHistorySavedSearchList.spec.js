import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import UserHistorySavedSearchList from '@/pages/UserHistorySavedSearchList'

const propsData = {
  events: [
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
      type: 'SEARCH',
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
}

describe('UserHistorySavedSearchList.vue', () => {
  let i18n, localVue, api

  let wrapper = null

  beforeAll(() => {
    api = { deleteUserHistoryEvent: vi.fn() }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })
  beforeEach(async () => {
    api.deleteUserHistoryEvent.mockClear()
    api.deleteUserHistoryEvent.mockResolvedValue({})

    wrapper = await shallowMount(UserHistorySavedSearchList, { i18n, localVue, propsData })
  })

  it('should NOT display a list of search', async () => {
    const propsData = { events: [] }
    wrapper = await shallowMount(UserHistorySavedSearchList, { i18n, localVue, propsData })
    expect(wrapper.findAll('.user-history-saved-search-list__list__item')).toHaveLength(0)
  })

  it('should display a list of search', async () => {
    expect(wrapper.findAll('.user-history-saved-search-list__list__item')).toHaveLength(2)
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

    expect(api.deleteUserHistoryEvent).toBeCalledTimes(1)
    expect(api.deleteUserHistoryEvent).toBeCalledWith(event.id)
  })

  it('should display date and time of the search', async () => {
    const event = {
      id: '1',
      type: 'SEARCH',
      name: 'name_01',
      uri: 'uri_01',
      creationDate: '2023-02-26T09:56:47.661+00:00'
    }

    const propsData = { events: [event] }
    wrapper = await shallowMount(UserHistorySavedSearchList, { i18n, localVue, propsData })

    expect(wrapper.find('.user-history-saved-search-list__list__item__date').text()).toBe('2023/02/26 09:56')
  })

  it('should parse uri with multiple fields with the same filter name', () => {
    const uri = '/?q=*&indices=cantina,local-datashare&f[language]=FRENCH&f[language]=ENGLISH'
    const filters = wrapper.vm.createFiltersFromURI(uri)
    expect(filters[0].name).toBe('projects')
    expect(filters[1].name).toBe('f[language]')
    expect(filters[2].name).toBe('f[language]')
  })
})
