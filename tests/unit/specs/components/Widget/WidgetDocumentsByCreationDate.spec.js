import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDocumentsByCreationDate from '@/components/Widget/WidgetDocumentsByCreationDate'

describe('WidgetDocumentsByCreationDate.vue', () => {
  const { index: project } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const props = { project, widget: { title: 'Hello world' } }

  let wrapper

  describe('with one valid creation date', () => {
    beforeEach(() => {
      const { plugins } = CoreSetup.init().useAll()
      const global = { plugins, renderStubDefaultSlot: true }
      wrapper = shallowMount(WidgetDocumentsByCreationDate, { props, global })
    })

    it('should be a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    it('should rerun init on project change', async () => {
      const init = vi.spyOn(wrapper.vm, 'init').mockImplementationOnce(vi.fn())
      wrapper.setProps({ project: anotherProject })
      await flushPromises()
      expect(init).toBeCalledTimes(1)
      wrapper.setProps({ project })
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
      const { plugins } = CoreSetup.init().useAll()
      const global = { plugins, renderStubDefaultSlot: true }
      wrapper = shallowMount(WidgetDocumentsByCreationDate, { global, props })
      wrapper.setProps({ project: anotherProject })
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
      expect(query).toStrictEqual({ 'f[creationDate]': '1356998400000:1388534400000', indices: [anotherProject] })
    })
  })
})
