import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDocumentsByCreationDateByPath from '@/components/Widget/WidgetDocumentsByCreationDateByPath'
import { useInsightsStore } from '@/store/modules/insights'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const props = { widget: { title: 'Hello world' } }

  let store, wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    store = useInsightsStore()
    wrapper = shallowMount(WidgetDocumentsByCreationDateByPath, { props, global: { plugins } })
  })

  it('should be a Vue instance with a project', () => {
    expect(wrapper).toBeTruthy()
    expect(wrapper.vm.project).toBe(store.project)
  })
})
