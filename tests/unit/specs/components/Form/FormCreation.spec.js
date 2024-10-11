import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormCreation from '@/components/Form/FormCreation'

describe('FormCreation', () => {
  let wrapper, plugins

  beforeEach(() => {
    plugins = CoreSetup.init().useAll().plugins
    wrapper = mount(FormCreation, { global: { plugins } })
  })

  it('should show the delete button', async () => {
    expect(wrapper.find('.form-creation__action--delete').exists()).toBe(false)
    await wrapper.setProps({ showDeleteButton: true })
    expect(wrapper.find('.form-creation__action--delete').exists()).toBe(true)
  })
})
