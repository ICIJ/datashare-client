import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetDocumentsByCreationDate from '@/components/WidgetDocumentsByCreationDate'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetDocumentsByCreationDate.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const propsData = { widget: { title: 'Hello world' } }
  const project = toLower('WidgetDocumentsByCreationDate')
  const anotherProject = toLower('anotherProject')
  esConnectionHelper([project, anotherProject])
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('insights/project', project))

  it('should be a Vue instance', () => {
    const wrapper = shallowMount(WidgetDocumentsByCreationDate,
      { i18n, localVue, propsData, store, wait })

    expect(wrapper).toBeTruthy()
  })

  it('should display a barchart with 2 bars', async () => {
    const wrapper = shallowMount(WidgetDocumentsByCreationDate,
      { i18n, localVue, propsData, store, wait, attachToDocument: true })
    await wrapper.vm.$set(wrapper.vm, 'data',
      [{ date: new Date('2012-02'), doc_count: 2 }, { date: new Date('2012-03'), doc_count: 4 }])

    expect(wrapper.findAll('svg')).toHaveLength(1)
    expect(wrapper.findAll('svg rect')).toHaveLength(2)
  })

  it('should filter data where creation date < 1970', async () => {
    await letData(es).have(new IndexedDocument('document_01', project)
      .withCreationDate('2019-08-19T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_02', project)
      .withCreationDate('0000-01-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_03', project)
      .withCreationDate('1968-01-01T00:00:00.000Z')).commit()
    const wrapper = await shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait, attachToDocument: true })

    await wrapper.vm.loadData()

    expect(wrapper.vm.data).toHaveLength(1)
  })

  it('should rerun init on project change', async () => {
    const wrapper = shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait, attachToDocument: true })
    const init = jest.spyOn(wrapper.vm, 'init')
    await wrapper.vm.$nextTick()
    expect(init).toBeCalledTimes(1)
    await store.commit('insights/project', anotherProject)
    expect(init).toBeCalledTimes(2)
    await store.commit('insights/project', project)
  })

  describe('selectedInterval value and selectors', () => {
    let wrapper

    beforeEach(() => {
      wrapper = shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait, attachToDocument: true })
    })

    it('should display 3 selectors', () => {
      expect(wrapper.findAll('.widget__header__selectors__selector')).toHaveLength(3)
    })

    it('selectedInterval default value should be year', () => {
      expect(wrapper.vm.selectedInterval).toBe('year')
    })

    it('should change the value of the selectedInterval and reload data', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withCreationDate('2019-08-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withCreationDate('2019-07-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', project)
        .withCreationDate('2019-06-01T00:00:00.000Z')).commit()
      wrapper = await shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait, attachToDocument: true })

      await wrapper.vm.selectInterval('year')

      expect(wrapper.vm.selectedInterval).toBe('year')
      expect(wrapper.vm.data).toHaveLength(1)
    })
  })
})
