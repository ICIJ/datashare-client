import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadEstimationErrorModal from '@/components/BatchDownload/BatchDownloadEstimationErrorModal'

describe('BatchDownloadEstimationErrorModal.vue', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('renders the description text', () => {
    const wrapper = mount(BatchDownloadEstimationErrorModal, {
      global: { plugins, stubs: { 'app-modal': { template: '<div><slot /></div>' } } }
    })
    expect(wrapper.text()).toContain('could not verify')
  })
})
