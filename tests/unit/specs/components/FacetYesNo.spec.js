import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import vBFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox'
import vBFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group'
import FacetYesNo from '@/components/FacetYesNo'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getStarredDocuments: jest.fn().mockReturnValue(jsonOk(['doc_01', 'doc_02']))
    }
  })
})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.component('b-form-checkbox', vBFormCheckbox)
localVue.component('b-form-checkbox-group', vBFormCheckboxGroup)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetYesNo.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    wrapper = mount(FacetYesNo, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'starred' }) }
    })
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should display 2 items for the starred facet', async () => {
    await letData(es).have(new IndexedDocument('doc')).commit()

    expect(wrapper.findAll('.facet__items__item .custom-control-label')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item .custom-control-label').at(0).text()).toEqual('Starred')
    expect(wrapper.findAll('.facet__items__item .custom-control-label').at(1).text()).toEqual('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('doc')).commit()

    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()

    wrapper.findAll('.facet__items__item .custom-control-input').at(0).trigger('click')
    expect(wrapper.vm.selected).toEqual([true])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()

    wrapper.findAll('.facet__items__item .custom-control-input').at(1).trigger('click')
    expect(wrapper.vm.selected).toEqual([false])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()

    wrapper.findAll('.facet__items__item .custom-control-input').at(1).trigger('click')
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()
  })

  it('should select the starred documents', async () => {
    await letData(es).have(new IndexedDocument('doc')).commit()

    expect(wrapper.vm.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should hide the "Show more" button', async () => {
    await letData(es).have(new IndexedDocument('doc')).commit()

    expect(wrapper.findAll('.facet__items__display')).toHaveLength(0)
  })
})
