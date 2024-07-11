import { shallowMount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDiskUsage from '@/components/Widget/WidgetDiskUsage'

describe('WidgetDiskUsage.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const { index: anotherProject } = esConnectionHelper.build()
  const props = { widget: { title: 'Hello world' } }
  let wrapper

  beforeEach(() => {
    const { store, plugins, config } = CoreSetup.init(api).useAll()
    config.merge({ dataDir: 'dataDir' })
    store.commit('insights/reset')
    store.commit('insights/project', project)
    wrapper = shallowMount(WidgetDiskUsage, { global: { plugins, renderStubDefaultSlot: true }, props })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    await letData(es).have(new IndexedDocument('document', project).withContentLength(10)).commit()
    await wrapper.vm.loadData()

    expect(wrapper.find('.widget__main-figure').text()).toBe('10.00 B')
  })

  it('should reset path on project change', async () => {
    await wrapper.setData({ path: 'path_01' })
    expect(wrapper.vm.path).toBe('path_01')
    wrapper.vm.$store.commit('insights/project', anotherProject)
    await flushPromises()
    expect(wrapper.vm.path).toBe('dataDir')
  })
})
