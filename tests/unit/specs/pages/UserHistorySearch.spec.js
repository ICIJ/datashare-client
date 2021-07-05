import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'

import UserHistorySearch from '@/pages/UserHistorySearch'

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

  it('should NOT display a list of search', async () => {
    const propsData = { events: [] }
    wrapper = await shallowMount(UserHistorySearch, { i18n, localVue, propsData })
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(0)
  })

  it('should display a list of search', async () => {
    expect(wrapper.findAll('.user-history__list__item')).toHaveLength(2)
  })
})
