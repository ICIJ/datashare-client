import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import vBFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox'
import vBFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group'
import FacetDate from '@/components/FacetDate'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.component('b-form-checkbox', vBFormCheckbox)
localVue.component('b-form-checkbox-group', vBFormCheckboxGroup)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetDate.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    wrapper = mount(FacetDate, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'creation-date' }) } })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display an creation date facet with 2 months', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withCreationDate('2018-04-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withCreationDate('2018-05-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withCreationDate('2018-05-01T00:00:00.000Z')).commit()

    await wrapper.vm.root.aggregate()

    const getItem = (idx) => wrapper.findAll('.facet__items__item .custom-checkbox').at(idx)
    const getItemChild = (idx, selector) => getItem(idx).find(selector)
    const getItemChildText = (idx, selector) => getItemChild(idx, selector).text()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(getItemChildText(0, '.facet__items__item__label')).toEqual('2018-05')
    expect(getItemChildText(0, '.facet__items__item__count')).toEqual('2')
    expect(getItemChildText(1, '.facet__items__item__label')).toEqual('2018-04')
    expect(getItemChildText(1, '.facet__items__item__count')).toEqual('1')
    expect(wrapper.vm.root.totalCount).toEqual(3)
  })

  it('should display missing dates as "Missing" item', async () => {
    await letData(es).have(new IndexedDocument('doc_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.find('.facet__items__item .facet__items__item__label').text()).toEqual('Missing date')
    expect(wrapper.find('.facet__items__item .facet__items__item__count').text()).toEqual('2')
  })
})
