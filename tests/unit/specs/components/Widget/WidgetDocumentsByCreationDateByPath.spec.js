import { mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDocumentsByCreationDateByPath from '@/components/Widget/WidgetDocumentsByCreationDateByPath'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const props = { widget: { title: 'Hello world' } }
  let wrapper

  beforeEach(() => {
    const { config, store, plugins } = CoreSetup.init(api).useAll()
    config.merge({ dataDir: 'dataDir' })
    store.commit('insights/project', project)
    wrapper = mount(WidgetDocumentsByCreationDateByPath, { props, global: { plugins } })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should reset selectedPath on project change', async () => {
    await wrapper.setData({ selectedPath: 'path_01' })
    expect(wrapper.vm.selectedPath).toBe('path_01')
    wrapper.vm.$store.commit('insights/project', anotherProject)
    await flushPromises()
    expect(wrapper.vm.selectedPath).toBe('dataDir')
  })
})
