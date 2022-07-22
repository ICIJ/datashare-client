import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetDocumentsByCreationDate from '@/components/widget/WidgetDocumentsByCreationDate'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetDocumentsByCreationDate.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const propsData = { widget: { title: 'Hello world' } }
  let wrapper = null

  beforeAll(() => store.commit('insights/project', project))

  beforeEach(() => {
    wrapper = shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should filter data where creation date < 1970', async () => {
    await letData(es).have(new IndexedDocument('document_01', project)
      .withCreationDate('2019-08-19T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_02', project)
      .withCreationDate('0000-01-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('document_03', project)
      .withCreationDate('1968-01-01T00:00:00.000Z')).commit()

    await wrapper.vm.loadData()

    expect(wrapper.vm.data).toHaveLength(1)
  })

  it('should rerun init on project change', async () => {
    const init = jest.spyOn(wrapper.vm, 'init')
    await store.commit('insights/project', anotherProject)
    expect(init).toBeCalledTimes(1)
    await store.commit('insights/project', project)
    expect(init).toBeCalledTimes(2)
  })

  describe('selectedInterval value and selectors', () => {
    it('should display 2 selectors', () => {
      expect(wrapper.findAll('.widget__header__selectors__selector')).toHaveLength(2)
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

      await wrapper.vm.setSelectedInterval('year')

      expect(wrapper.vm.selectedInterval).toBe('year')
      expect(wrapper.vm.data).toHaveLength(0)
    })
  })

  describe('missing data', () => {
    it('should display no message if no data are missing', async () => {
      await wrapper.setData({
        data: [{ date: new Date('2012-02'), doc_count: 2 }, { date: new Date('2012-03'), doc_count: 4 }],
        missing: 0
      })

      expect(wrapper.find('.widget__content__missing').exists()).toBeFalsy()
    })

    it('should display a message if data are missing', async () => {
      await wrapper.setData({
        data: [{ date: new Date('2012-02'), doc_count: 2 }, { date: new Date('2012-03'), doc_count: 4 }],
        missing: 2
      })

      expect(wrapper.find('.widget__content__missing').exists()).toBeTruthy()
    })

    it('should count missing creation dates while loading data', async () => {
      await letData(es).have(new IndexedDocument('document_01', project)
        .withCreationDate('2019-08-19T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_02', project)
        .withCreationDate('0000-01-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('document_03', project)
        .withCreationDate('1968-01-01T00:00:00.000Z')).commit()

      await wrapper.vm.loadData()

      expect(wrapper.vm.missing).toBe(2)
    })
  })
})
