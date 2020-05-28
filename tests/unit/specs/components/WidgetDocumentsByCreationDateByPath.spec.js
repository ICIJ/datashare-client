import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import WidgetDocumentsByCreationDateByPath from '@/components/WidgetDocumentsByCreationDateByPath'
import { Core } from '@/core'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const propsData = { widget: { title: 'Hello world' } }
  const project = toLower('WidgetDocumentsByCreationDateByPath')
  esConnectionHelper([project])

  beforeAll(() => store.commit('insights/project', project))

  it('should be a Vue instance', () => {
    const wrapper = mount(WidgetDocumentsByCreationDateByPath, { i18n, localVue, propsData, store, wait })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
