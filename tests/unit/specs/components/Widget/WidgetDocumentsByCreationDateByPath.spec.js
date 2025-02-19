import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import WidgetDocumentsByCreationDateByPath from '@/components/Widget/WidgetDocumentsByCreationDateByPath'

describe('WidgetDocumentsByCreationDateByPath.vue', () => {
  const props = { widget: { title: 'Hello world' } }

  let wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = shallowMount(WidgetDocumentsByCreationDateByPath, { props, global: { plugins } })
  })

  it('should be a Vue instance', () => {
    expect(wrapper).toBeTruthy()
  })
})
