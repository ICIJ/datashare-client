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

  it('renders the file-limit message when estimatedCount exceeds maxNbFiles', () => {
    const wrapper = factory({
      estimatedCount: 100,
      estimatedSize: 0,
      maxNbFiles: 10,
      maxSizeBytes: 1000
    })
    const text = wrapper.text()
    expect(text).toContain('100')
    expect(text).toContain('10')
  })

  it('renders the size-limit message when estimatedSize exceeds maxSizeBytes', () => {
    const wrapper = factory({
      estimatedCount: 0,
      estimatedSize: 5000,
      maxNbFiles: 100,
      maxSizeBytes: 1000
    })
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs).toHaveLength(1)
  })

  it('renders both messages when both limits are exceeded', () => {
    const wrapper = factory({
      estimatedCount: 100,
      estimatedSize: 5000,
      maxNbFiles: 10,
      maxSizeBytes: 1000
    })
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs).toHaveLength(2)
  })

  it('renders no paragraph when neither limit is exceeded', () => {
    const wrapper = factory({
      estimatedCount: 1,
      estimatedSize: 1,
      maxNbFiles: 10,
      maxSizeBytes: 1000
    })
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs).toHaveLength(0)
  })
})
