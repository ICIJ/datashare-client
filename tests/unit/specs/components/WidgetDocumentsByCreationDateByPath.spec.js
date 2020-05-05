import toLower from 'lodash/toLower'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'

import WidgetDocumentsByCreationDateByPath from '@/components/WidgetDocumentsByCreationDateByPath'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const project = toLower('WidgetDocumentsByCreationDateByPath')
  const anotherProject = toLower('anotherProject')
  esConnectionHelper([project, anotherProject])
  const es = esConnectionHelper.es
  Murmur.config.set('dataDir', '/data')

  it('should load the paths', async () => {
    const propsData = { widget: { title: 'Hello world' } }
    const wrapper = mount(WidgetDocumentsByCreationDateByPath, { i18n, localVue, propsData, store, wait })

    await letData(es).have(new IndexedDocument('/data/folder_01/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_02/document', project)).commit()
    await letData(es).have(new IndexedDocument('/data/folder_03/document', project)).commit()

    await wrapper.vm.loadPath()

    expect(wrapper.vm.paths).toEqual([
      { folder: '', label: 'All' },
      { folder: 'folder_01', label: 'folder_01' },
      { folder: 'folder_02', label: 'folder_02' },
      { folder: 'folder_03', label: 'folder_03' }
    ])
  })

  it('should reload paths on project change', async () => {
    const propsData = { widget: { title: 'Hello world' } }
    const wrapper = mount(WidgetDocumentsByCreationDateByPath, { i18n, localVue, propsData, store, wait })

    const loadPath = jest.spyOn(wrapper.vm, 'loadPath')
    await wrapper.vm.$nextTick()
    expect(loadPath).toBeCalledTimes(1)

    await store.commit('insights/project', anotherProject)
    expect(loadPath).toBeCalledTimes(2)
    await store.commit('insights/project', project)
  })
})
