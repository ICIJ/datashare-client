import FacetDateRange from '@/components/FacetDateRange'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { BFormInput } from 'bootstrap-vue'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import find from 'lodash/find'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.component('b-form-input', BFormInput)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetDateRange.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper
  const name = 'creation-date'

  beforeEach(() => {
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    wrapper = mount(FacetDateRange, { localVue, i18n, store, router, propsData: { facet: find(store.state.search.facets, { name }) } })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display a date picker', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withCreationDate('2018-04-01T00:00:00.000Z')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.find('.facet__items .date-picker input').exists()).toBeTruthy()
    expect(wrapper.find('.facet__items .date-picker input').attributes('placeholder')).toBe('Select a date range')
  })

  it('should add selected value to dedicated facet', () => {
    const start = new Date('2019-08-19')
    const end = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    wrapper.vm.onInput()

    const existingFacet = find(store.state.search.facets, { name })
    expect(existingFacet.values).toEqual([start.getTime(), end.getTime()])
  })

  it('should set selected value to dedicated facet, as the only one value', () => {
    const start = new Date('2018-08-19')
    const end = new Date('2018-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })
    wrapper.vm.onInput()

    const start2 = new Date('2019-08-19')
    const end2 = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start: start2, end: end2 })
    wrapper.vm.onInput()

    const existingFacet = find(store.state.search.facets, { name })
    expect(existingFacet.values).toEqual([start2.getTime(), end2.getTime()])
  })

  it('should reset selectedDate on event "reset-facet-values"', () => {
    const start = new Date('2018-08-19')
    const end = new Date('2018-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    wrapper.vm.root.$emit('reset-facet-values')

    expect(wrapper.vm.selectedDate).toBeNull()
  })

  it('should update selectedDate from the store value', () => {
    store.commit('search/setFacetValue', { name, value: [new Date('2018-01-01').getTime(), new Date('2018-12-31').getTime()] })
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start: new Date('2019-08-19'), end: new Date('2019-08-22') })

    wrapper.vm.selectedValuesFromStore()
    wrapper.vm.$emit('selected-values-from-store')

    expect(wrapper.vm.selectedDate).toEqual({ start: new Date('2018-01-01'), end: new Date('2018-12-31') })
  })
})
