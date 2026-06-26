import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadUnavailableAlert from '@/components/BatchDownload/BatchDownloadUnavailableAlert'

describe('BatchDownloadUnavailableAlert.vue', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('renders the unavailable message with the muted style', () => {
    const wrapper = mount(BatchDownloadUnavailableAlert, { global: { plugins } })
    const alert = wrapper.find('.batch-download-unavailable-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('text-muted')
    expect(alert.text()).toBe('This download is no longer available.')
  })
})
