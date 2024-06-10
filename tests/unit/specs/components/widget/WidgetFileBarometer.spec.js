import { shallowMount } from '@vue/test-utils'

import { IndexedDocuments, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetFileBarometer from '@/components/widget/WidgetFileBarometer'

describe('WidgetFileBarometer.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const props = { widget: { title: 'Hello world' } }
  let wrapper = null

  beforeEach(() => {
    const { store, plugins } = CoreSetup.init(api).useAll()
    store.commit('insights/reset')
    store.commit('insights/project', project)
    wrapper = shallowMount(WidgetFileBarometer, { global: { plugins, renderStubDefaultSlot: true }, props })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should display the total number of document', async () => {
    await letData(es).have(new IndexedDocuments().withIndex(project).count(10)).commit()
    await wrapper.vm.loadData()

    expect(wrapper.find('.widget__main-figure').text()).toBe('10 documents')
  })
})
