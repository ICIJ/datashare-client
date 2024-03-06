import { createLocalVue, mount } from '@vue/test-utils'
import Murmur from '@icij/murmur'
import { flushPromises } from '~tests/unit/tests_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

import WidgetDocumentsByCreationDateByPath from '@/components/widget/WidgetDocumentsByCreationDateByPath'
import { Core } from '@/core'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const { i18n, localVue, store, wait } = Core.init(createLocalVue(), api).useAll()
  const propsData = { widget: { title: 'Hello world' } }
  let wrapper = null

  beforeAll(() => {
    Murmur.config.merge({ dataDir: 'dataDir' })
    store.commit('insights/project', project)
  })

  beforeEach(() => {
    wrapper = mount(WidgetDocumentsByCreationDateByPath, { i18n, localVue, propsData, store, wait })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should reset treeViewPath on project change', async () => {
    await wrapper.setData({ treeViewPath: 'path_01' })
    expect(wrapper.vm.treeViewPath).toBe('path_01')
    store.commit('insights/project', anotherProject)
    await flushPromises()
    expect(wrapper.vm.treeViewPath).toBe('dataDir')
  })
})
