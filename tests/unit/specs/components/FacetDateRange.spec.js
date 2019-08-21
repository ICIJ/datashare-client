import FacetDateRange from '@/components/FacetDateRange'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import store from '@/store'
import find from 'lodash/find'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetDateRange.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    wrapper = mount(FacetDateRange, { localVue, i18n, store, propsData: { facet: find(store.state.search.facets, { name: 'creation-date' }) } })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display a date picker', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withCreationDate('2018-04-01T00:00:00.000Z')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.find('.facet__items .popover-container input').exists()).toBeTruthy()
    expect(wrapper.find('.facet__items .popover-container input').attributes('placeholder')).toBe('MM/DD/YYYY - MM/DD/YYYY')
  })
})
