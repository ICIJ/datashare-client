import { createLocalVue, shallowMount } from '@vue/test-utils'

import WidgetFileBarometer from '@/components/widget/WidgetFileBarometer'
import { Core } from '@/core'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetFileBarometer.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index: project, es } = esConnectionHelper.build()
  const propsData = { widget: { title: 'Hello world' } }
  let wrapper = null

  beforeEach(() => {
    store.commit('insights/reset')
    store.commit('insights/project', project)
    wrapper = shallowMount(WidgetFileBarometer, { i18n, localVue, store, wait, propsData })
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
