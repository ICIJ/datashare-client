import { createLocalVue, shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import WidgetDiskUsage from '@/components/widget/WidgetDiskUsage'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetDiskUsage.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const propsData = { widget: { title: 'Hello world' } }
  let wrapper = null

  beforeEach(() => {
    Murmur.config.merge({ dataDir: 'dataDir' })
    store.commit('insights/reset')
    store.commit('insights/project', project)
    wrapper = shallowMount(WidgetDiskUsage, { i18n, localVue, store, wait, propsData })
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
    wrapper.vm.$set(wrapper.vm, 'path', 'path_01')
    expect(wrapper.vm.path).toBe('path_01')

    await store.commit('insights/project', anotherProject)

    expect(wrapper.vm.path).toBe('dataDir')
  })
})
