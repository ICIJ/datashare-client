import { mount } from '@vue/test-utils'

import { IndexedDocuments, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDocuments from '@/components/Widget/WidgetDocuments'

describe('WidgetDocuments.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const props = { project, widget: { title: 'Hello world' } }
  let wrapper = null

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = mount(WidgetDocuments, { global: { plugins }, props })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    await letData(es).have(new IndexedDocuments().withIndex(project).count(10)).commit()
    await wrapper.vm.loadData()
    expect(wrapper.find('.widget-barometer__value').text()).toBe('10 documents')
  })
})
