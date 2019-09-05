import BatchSearch from '@/pages/BatchSearch'
import { createLocalVue, mount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import BootstrapVue from 'bootstrap-vue'
import VueProgressBar from 'vue-progressbar'
import Murmur from '@icij/murmur'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

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
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.use(VueProgressBar)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('BatchSearch.vue', () => {
  let wrapper

  beforeAll(() => Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] }))

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { localVue, i18n, store, router })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should list the searches', () => {
    expect(wrapper.findAll('.batch-search__items__item')).toHaveLength(2)
  })

  it('should display a link to batch search page with from and size as URL query string', () => {
    expect(wrapper.findAll('.batch-search__items__item__link')).toHaveLength(2)
    expect(wrapper.findAll('.batch-search__items__item__link').at(0).attributes('href')).toBe('#/batch-search/project_01/1?from=0&size=100&sort=doc_nb&order=asc')
    expect(wrapper.findAll('.batch-search__items__item__link').at(1).attributes('href')).toBe('#/batch-search/project_02/2?from=0&size=100&sort=doc_nb&order=asc')
  })

  it('should display 7 columns of info per row', () => {
    expect(wrapper.findAll('.batch-search__items__item:nth-child(1) td')).toHaveLength(7)
  })
})
