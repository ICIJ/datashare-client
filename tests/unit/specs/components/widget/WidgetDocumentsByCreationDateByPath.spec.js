import { createLocalVue, mount } from '@vue/test-utils'
import Murmur from '@icij/murmur'

import WidgetDocumentsByCreationDateByPath from '@/components/widget/WidgetDocumentsByCreationDateByPath'
import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index: project } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
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
    wrapper.vm.$set(wrapper.vm, 'treeViewPath', 'path_01')
    expect(wrapper.vm.treeViewPath).toBe('path_01')

    await store.commit('insights/project', anotherProject)

    expect(wrapper.vm.treeViewPath).toBe('dataDir')
  })
})
