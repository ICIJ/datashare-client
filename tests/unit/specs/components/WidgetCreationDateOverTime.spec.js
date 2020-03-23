import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetCreationDateOverTime from '@/components/WidgetCreationDateOverTime'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetCreationDateOverTime.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const widget = { title: 'Hello world' }
  const propsData = { widget }
  const index = toLower('WidgetCreationDateOverTime')
  const anotherIndex = toLower('anotherIndex')
  const methods = { loadData: () => [{ date: new Date('2012-02'), doc_count: 2 }, { date: new Date('2012-03'), doc_count: 4 }] }
  esConnectionHelper([index, anotherIndex])
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('insights/index', index))

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetCreationDateOverTime, { i18n, localVue, methods, propsData, store, wait })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display a barchart with 2 bars', async () => {
    const wrapper = shallowMount(WidgetCreationDateOverTime, { i18n, localVue, methods, propsData, store, wait, attachToDocument: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('svg')).toHaveLength(1)
    expect(wrapper.findAll('svg rect')).toHaveLength(2)
  })

  it('should filter data where creation date < 1970', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withCreationDate('2019-08-19T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withCreationDate('0000-01-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withCreationDate('1968-01-01T00:00:00.000Z')).commit()
    const wrapper = await shallowMount(WidgetCreationDateOverTime, { i18n, localVue, propsData, store, wait, attachToDocument: true })

    const data = await wrapper.vm.loadData()

    expect(data).toHaveLength(1)
  })

  it('should rerun init on index change', async () => {
    const wrapper = shallowMount(WidgetCreationDateOverTime, { i18n, localVue, methods, propsData, store, wait, attachToDocument: true })
    const init = jest.spyOn(wrapper.vm, 'init')
    await wrapper.vm.$nextTick()
    expect(init).toBeCalledTimes(1)
    await store.commit('insights/index', anotherIndex)
    expect(init).toBeCalledTimes(2)
    await store.commit('insights/index', index)
  })

  describe('interval value and selectors', () => {
    let wrapper

    beforeEach(() => {
      wrapper = shallowMount(WidgetCreationDateOverTime, { i18n, localVue, propsData, store, wait, attachToDocument: true })
    })

    it('should display 3 selectors', () => {
      expect(wrapper.findAll('.widget__header__selectors__selector')).toHaveLength(3)
    })

    it('interval default value should be month', () => {
      expect(wrapper.vm.interval).toBe('month')
    })

    it('should change the value of the interval and reload data', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withCreationDate('2019-08-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withCreationDate('2019-07-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', index)
        .withCreationDate('2019-06-01T00:00:00.000Z')).commit()
      wrapper = await shallowMount(WidgetCreationDateOverTime, { i18n, localVue, propsData, store, wait, attachToDocument: true })

      await wrapper.vm.click('year')

      expect(wrapper.vm.interval).toBe('year')
      expect(wrapper.vm.data).toHaveLength(1)
    })
  })
})
