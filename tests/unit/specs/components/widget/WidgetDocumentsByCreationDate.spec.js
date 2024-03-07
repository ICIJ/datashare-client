import { createLocalVue, shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { Core } from '@/core'
import WidgetDocumentsByCreationDate from '@/components/widget/WidgetDocumentsByCreationDate'

describe('WidgetDocumentsByCreationDate.vue', () => {
  const { index: project, es: elasticsearch } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const { i18n, localVue, store, wait } = Core.init(createLocalVue(), { elasticsearch }).useAll()
  const propsData = { widget: { title: 'Hello world' } }
  let wrapper = null

  describe('with one valid creation date', () => {
    beforeEach(() => {
      store.commit('insights/project', project)
      wrapper = shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait })
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should rerun init on project change', async () => {
      const init = vi.spyOn(wrapper.vm, 'init').mockImplementationOnce(vi.fn())
      store.commit('insights/project', anotherProject)
      await flushPromises()
      expect(init).toBeCalledTimes(1)
      store.commit('insights/project', project)
      await flushPromises()
      expect(init).toBeCalledTimes(2)
    })

    it('should display no message if no data are missing', async () => {
      await wrapper.setData({
        data: [
          { date: new Date(2012, 1), key: 1328050800000, doc_count: 2 },
          { date: new Date(2012, 2), key: 1330556400000, doc_count: 4 }
        ]
      })

      expect(wrapper.find('.widget__content__missing').exists()).toBeFalsy()
    })

    it('should display a message if data are missing', async () => {
      await wrapper.setData({
        data: [
          { date: new Date(2012, 1), key: 1328050800000, doc_count: 2 },
          { date: new Date(2012, 2), key: 1330556400000, doc_count: 4 },
          { date: new Date(1968, 0, 1), key: -63158400000, doc_count: 4 }
        ]
      })

      expect(wrapper.find('.widget__content__missing').exists()).toBeTruthy()
    })
  })

  describe('with 3 valid creation date', () => {
    beforeEach(() => {
      store.commit('insights/project', anotherProject)
      wrapper = shallowMount(WidgetDocumentsByCreationDate, { i18n, localVue, propsData, store, wait })
    })

    it('should display 2 selectors', () => {
      expect(wrapper.findAll('.widget__header__selectors__selector')).toHaveLength(2)
    })

    it('selectedInterval default value should be year', () => {
      expect(wrapper.vm.selectedInterval).toBe('year')
    })

    it('should change the value of the selectedInterval and reload data', async () => {
      await wrapper.vm.setSelectedInterval('year')
      expect(wrapper.vm.selectedInterval).toBe('year')
      expect(wrapper.vm.data).toHaveLength(0)
    })

    it('should give the correct search query params for a date', async () => {
      await wrapper.setData({
        data: [
          { date: new Date(2012, 0), key: 1325372400000, doc_count: 2 },
          { date: new Date(2013, 0), key: 1356994800000, doc_count: 4 },
          { date: new Date(2014, 0), key: 1388534400000, doc_count: 4 }
        ]
      })

      const bin = wrapper.vm.dateToBin(new Date(2013, 0))
      const query = wrapper.vm.binToQuery(bin)
      expect(query).toStrictEqual({ 'f[creationDate]': [1356998400000, 1388534400000], indices: [anotherProject] })
    })
  })
})
