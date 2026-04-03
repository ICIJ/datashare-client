import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadTruncatedAlert from '@/components/BatchDownload/BatchDownloadTruncatedAlert'

describe('BatchDownloadTruncatedAlert.vue', () => {
  let plugins, config

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    config = core.config
  })

  beforeEach(() => {
    config.set('batchDownloadMaxSize', '1G')
    config.set('batchDownloadMaxNbFiles', '10000')
  })

  it('does not render when truncationReason is null', () => {
    const wrapper = mount(BatchDownloadTruncatedAlert, {
      global: { plugins },
      props: { truncationReason: null }
    })
    expect(wrapper.find('.batch-download-truncated-alert').exists()).toBe(false)
  })

  it('displays the SIZE_LIMIT message with bold reason and formatted size', () => {
    const wrapper = mount(BatchDownloadTruncatedAlert, {
      global: { plugins },
      props: { truncationReason: 'SIZE_LIMIT' }
    })
    const alert = wrapper.find('.batch-download-truncated-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.find('strong').text()).toBe('size limit')
    expect(alert.text()).toContain('truncated after reaching the size limit')
    expect(alert.text()).toContain('1 GB')
  })

  it('displays the FILE_COUNT_LIMIT message with bold reason and formatted file count', () => {
    const wrapper = mount(BatchDownloadTruncatedAlert, {
      global: { plugins },
      props: { truncationReason: 'FILE_COUNT_LIMIT' }
    })
    const alert = wrapper.find('.batch-download-truncated-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.find('strong').text()).toBe('maximum number of files')
    expect(alert.text()).toContain('truncated after reaching the maximum number of files')
    expect(alert.text()).toContain('10,000')
  })
})
