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
import map from 'lodash/map'

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
  jest.setTimeout(1e4)

  beforeEach(() => {
    wrapper = mount(FacetYesNo, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'starred' }) }
    })
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => {
    map(store.state.search.starredDocuments, documentId => {
      store.commit('search/removeFromStarredDocuments', documentId)
    })
  })

  it('should display 2 items for the starred facet', async () => {
    await letData(es).have(new IndexedDocument('doc_01')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-control-label .facet__items__item__label')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item .custom-control-label .facet__items__item__label').at(0).text()).toEqual('Starred')
    expect(wrapper.findAll('.facet__items__item .custom-control-label .facet__items__item__label').at(1).text()).toEqual('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('doc_02')).commit()

    await wrapper.vm.root.aggregate()

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

  it('should hide the "Show more" button', async () => {
    await letData(es).have(new IndexedDocument('doc_04')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display')).toHaveLength(0)
  })

  it('should display the results count', async () => {
    await letData(es).have(new IndexedDocument('doc_05')).commit()
    await letData(es).have(new IndexedDocument('doc_06')).commit()
    await letData(es).have(new IndexedDocument('doc_07')).commit()
    store.commit('search/pushFromStarredDocuments', 'doc_05')
    store.commit('search/pushFromStarredDocuments', 'doc_06')
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .facet__items__item__count')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__count').at(0).text()).toEqual('2')
    expect(wrapper.findAll('.facet__items__item .facet__items__item__count').at(1).text()).toEqual('1')
  })

  it('should reload the facet after a newly starred document', async () => {
    await letData(es).have(new IndexedDocument('doc_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')).commit()
    await letData(es).have(new IndexedDocument('doc_04')).commit()
    store.commit('search/pushFromStarredDocuments', 'doc_01')
    store.commit('search/pushFromStarredDocuments', 'doc_02')
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .facet__items__item__count').at(0).text()).toEqual('2')

    store.commit('search/pushFromStarredDocuments', 'doc_04')

    expect(wrapper.findAll('.facet__items__item .facet__items__item__count').at(0).text()).toEqual('3')
  })
})
