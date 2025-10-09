import { mount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDiskUsage from '@/components/Widget/WidgetDiskUsage'
import { useInsightsStore } from '@/store/modules/insights'

describe('WidgetDiskUsage.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const props = { widget: { title: 'Hello world' } }
  let wrapper

  beforeEach(() => {
    const { plugins, config } = CoreSetup.init().useAll()
    const insightsStore = useInsightsStore()
    insightsStore.setProject(project)
    config.merge({ dataDir: 'dataDir' })
    wrapper = mount(WidgetDiskUsage, { global: { plugins, renderStubDefaultSlot: true }, props })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    await letData(es).have(new IndexedDocument('document', project).withContentLength(10)).commit()
    await wrapper.vm.loadData()
    expect(wrapper.find('.widget-barometer__value').text()).toBe('10.00 B')
  })
})
