import { createLocalVue, mount } from '@vue/test-utils'

import { App } from '@/main'
import BatchSearch from '@/pages/BatchSearch'

jest.mock('@/api/DatashareClient', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([{
        uuid: 1,
        project: { id: 'project_01', name: 'project_01' },
        name: 'name_01',
        description: 'description_01',
        queries: { query_01: 12 },
        date: '2019-01-01',
        nbResults: 2
      }, {
        uuid: 2,
        project: { id: 'project_02', name: 'project_02' },
        name: 'name_02',
        description: 'description_02',
        queries: { query_02: 2, query_03: 3 },
        date: '2019-01-01',
        nbResults: 3
      }]))
    }
  })
})

const { localVue, store, router } = App.init(createLocalVue()).useAll()

describe('BatchSearch.vue', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { localVue, store, router, mocks: { $t: msg => msg, $tc: (msg, count) => count, $n: msg => msg } })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should list the batchSearches', () => {
    expect(wrapper.findAll('.batch-search__items__item')).toHaveLength(2)
  })

  it('should display 7 columns of info per row', () => {
    expect(wrapper.findAll('.batch-search__items__item:nth-child(1) td')).toHaveLength(7)
  })

  it('should display the number of queries per batchSearch', () => {
    expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="3"]').text()).toEqual('1')
    expect(wrapper.find('.batch-search__items__item:nth-child(2) td[aria-colindex="3"]').text()).toEqual('2')
  })
})
