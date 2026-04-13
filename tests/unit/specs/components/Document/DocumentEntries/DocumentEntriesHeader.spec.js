import { mount, flushPromises } from '@vue/test-utils'
import { ref, computed } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentEntriesHeader from '@/components/Document/DocumentEntries/DocumentEntriesHeader'

const estimateMock = vi.fn()
const confirmExceedsLimitMock = vi.fn()
const exceedsLimitRef = ref(false)
const loadingRef = ref(false)

vi.mock('@/composables/useBatchDownloadEstimation', () => ({
  useBatchDownloadEstimation: () => ({
    loading: loadingRef,
    estimatedCount: ref(0),
    estimatedSize: ref(0),
    maxNbFiles: computed(() => 100),
    maxSizeBytes: computed(() => 1000),
    exceedsLimit: exceedsLimitRef,
    exceedsFileLimit: ref(false),
    exceedsSizeLimit: ref(false),
    formattedEstimatedSize: computed(() => '0 B'),
    formattedMaxSize: computed(() => '1 KB'),
    estimate: estimateMock
  })
}))

vi.mock('@/composables/useBatchDownloadConfirmModal', () => ({
  useBatchDownloadConfirmModal: () => ({
    show: vi.fn(),
    confirm: confirmExceedsLimitMock,
    hide: vi.fn()
  })
}))

const toastSuccessMock = vi.fn()
const toastErrorMock = vi.fn()
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    toast: { success: toastSuccessMock, error: toastErrorMock }
  })
}))

import { useSearchStore } from '@/store/modules'

describe('DocumentEntriesHeader.vue — runBatchDownload orchestration', () => {
  let plugins, runBatchDownloadSpy

  beforeEach(() => {
    const routes = [
      { name: 'search', path: '/search' },
      { name: 'task.batch-download.list', path: '/tasks/batch-download' }
    ]
    const core = CoreSetup.init().useAll().useRouter(routes)
    core.config.set('batchDownloadMaxNbFiles', 100)
    core.config.set('batchDownloadMaxSize', '1KB')
    plugins = core.plugins

    estimateMock.mockReset()
    confirmExceedsLimitMock.mockReset()
    toastSuccessMock.mockReset()
    toastErrorMock.mockReset()
    exceedsLimitRef.value = false
    loadingRef.value = false

    const searchStore = useSearchStore()
    runBatchDownloadSpy = vi.spyOn(searchStore, 'runBatchDownload').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function factory() {
    return mount(DocumentEntriesHeader, {
      global: {
        plugins,
        stubs: {
          'button-toggle-batch-mode': true,
          'row-pagination-documents': true
        }
      },
      props: { total: 10 }
    })
  }

  async function clickDownload(wrapper) {
    const btn = wrapper.findComponent({ name: 'ButtonDownloadDocuments' })
    btn.vm.$emit('click')
    await flushPromises()
  }

  it('runs the download and toasts success when estimation succeeds and limits are not exceeded', async () => {
    estimateMock.mockResolvedValue({ estimatedCount: 1, estimatedSize: 1 })
    exceedsLimitRef.value = false

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(estimateMock).toHaveBeenCalledTimes(1)
    expect(confirmExceedsLimitMock).not.toHaveBeenCalled()
    expect(runBatchDownloadSpy).toHaveBeenCalledTimes(1)
    expect(toastSuccessMock).toHaveBeenCalledTimes(1)
  })

  it('runs the download when limits are exceeded and the user confirms', async () => {
    estimateMock.mockResolvedValue({ estimatedCount: 999, estimatedSize: 9999 })
    exceedsLimitRef.value = true
    confirmExceedsLimitMock.mockResolvedValue(true)

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(confirmExceedsLimitMock).toHaveBeenCalledTimes(1)
    expect(runBatchDownloadSpy).toHaveBeenCalledTimes(1)
  })

  it('skips the download when limits are exceeded and the user cancels', async () => {
    estimateMock.mockResolvedValue({ estimatedCount: 999, estimatedSize: 9999 })
    exceedsLimitRef.value = true
    confirmExceedsLimitMock.mockResolvedValue(false)

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(confirmExceedsLimitMock).toHaveBeenCalledTimes(1)
    expect(runBatchDownloadSpy).not.toHaveBeenCalled()
  })

  it('runs the download when estimation fails and the user confirms the fallback', async () => {
    estimateMock.mockRejectedValue(new Error('boom'))
    confirmExceedsLimitMock.mockResolvedValue(true)

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(confirmExceedsLimitMock).toHaveBeenCalledTimes(1)
    expect(confirmExceedsLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      estimatedCount: null,
      estimatedSize: null
    }))
    expect(runBatchDownloadSpy).toHaveBeenCalledTimes(1)
  })

  it('skips the download when estimation fails and the user cancels the fallback', async () => {
    estimateMock.mockRejectedValue(new Error('boom'))
    confirmExceedsLimitMock.mockResolvedValue(false)

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(confirmExceedsLimitMock).toHaveBeenCalledTimes(1)
    expect(confirmExceedsLimitMock).toHaveBeenCalledWith(expect.objectContaining({
      estimatedCount: null,
      estimatedSize: null
    }))
    expect(runBatchDownloadSpy).not.toHaveBeenCalled()
  })

  it('toasts an error when runBatchDownload rejects', async () => {
    estimateMock.mockResolvedValue({ estimatedCount: 1, estimatedSize: 1 })
    exceedsLimitRef.value = false
    runBatchDownloadSpy.mockRejectedValue(new Error('network'))

    const wrapper = factory()
    await clickDownload(wrapper)

    expect(toastErrorMock).toHaveBeenCalledTimes(1)
    expect(toastSuccessMock).not.toHaveBeenCalled()
  })
})
