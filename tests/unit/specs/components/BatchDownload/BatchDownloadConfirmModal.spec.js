import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import BatchDownloadConfirmModal from '@/components/BatchDownload/BatchDownloadConfirmModal'

describe('BatchDownloadConfirmModal.vue', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function factory(props) {
    return mount(BatchDownloadConfirmModal, {
      global: { plugins, stubs: { 'app-modal': { template: '<div><slot /></div>' } } },
      props
    })
  }

  it('renders the known-truncation variant when both estimates are provided', () => {
    const wrapper = factory({
      maxNbFiles: 10,
      maxSizeBytes: 1024,
      estimatedCount: 100,
      estimatedSize: 2048
    })
    const text = wrapper.text()
    expect(text).toContain('100')
    expect(text).toContain('10')
    expect(text).toMatch(/\bproceed\b/i)
  })

  it('renders the unknown-truncation variant when estimates are null', () => {
    const wrapper = factory({
      maxNbFiles: 10,
      maxSizeBytes: 1024,
      estimatedCount: null,
      estimatedSize: null
    })
    const text = wrapper.text()
    expect(text).toContain('couldn\'t verify')
    expect(text).toMatch(/\bproceed\b/i)
  })

  it('renders the unknown-truncation variant when estimate props are omitted', () => {
    const wrapper = factory({
      maxNbFiles: 10,
      maxSizeBytes: 1024
    })
    const text = wrapper.text()
    expect(text).toContain('couldn\'t verify')
  })

  it('always renders the trailing question paragraph', () => {
    const wrapper = factory({
      maxNbFiles: 10,
      maxSizeBytes: 1024,
      estimatedCount: 100,
      estimatedSize: 2048
    })
    expect(wrapper.findAll('p')).toHaveLength(2) // the variant message + the question
  })
})
