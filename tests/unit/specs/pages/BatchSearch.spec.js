import BatchSearch from '@/pages/BatchSearch'
import { createLocalVue, mount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'
import BootstrapVue from 'bootstrap-vue'
import VueProgressBar from 'vue-progressbar'
import Murmur from '@icij/murmur'

jest.mock('@/api/DatashareClient', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([{
        uuid: 1,
        project: { id: 'project_01', name: 'project_01' },
        name: 'name_01',
        description: 'description_01',
        queries: ['query_01'],
        date: '2019-01-01',
        nbResults: 2
      }, {
        uuid: 2,
        project: { id: 'project_02', name: 'project_02' },
        name: 'name_02',
        description: 'description_02',
        queries: ['query_02'],
        date: '2019-01-01',
        nbResults: 3
      }]))
    }
  })
})

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.use(VueProgressBar)

describe('BatchSearch.vue', () => {
  let wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { localVue, store, router, mocks: { $t: msg => msg, $tc: msg => msg } })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should list the searches', () => {
    expect(wrapper.findAll('.batch-search__items__item')).toHaveLength(2)
  })

  it('should display 6 columns of info per row', () => {
    expect(wrapper.findAll('.batch-search__items__item:nth-child(1) td')).toHaveLength(6)
  })
})
