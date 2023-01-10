import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Api } from '@/api'
import { Core } from '@/core'
import UserHistorySearch from '@/pages/UserHistorySearch'

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

describe('UserHistorySearch.vue', () => {
  let i18n, localVue, mockAxios

  let wrapper = null

  beforeAll(() => {
    mockAxios = { request: jest.fn() }
    const api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })
  beforeEach(async () => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({})
    wrapper = await shallowMount(UserHistorySearch, { i18n, localVue, propsData })
  })

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

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/users/me/history/event'),
        method: 'DELETE',
        params: {
          id: event.id
        }
      })
    )
  })
})
