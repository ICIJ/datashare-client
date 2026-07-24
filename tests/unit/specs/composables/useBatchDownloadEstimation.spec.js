import { mount, flushPromises } from '@vue/test-utils'

import { useBatchDownloadEstimation } from '@/composables/useBatchDownloadEstimation'
import { useSearchStore } from '@/store/modules'
import CoreSetup from '~tests/unit/CoreSetup'

describe('useBatchDownloadEstimation composable', () => {
  let core, plugins

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    core.config.set('batchDownloadMaxNbFiles', 10)
    core.config.set('batchDownloadMaxSize', '1K')
    plugins = core.plugins
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useBatchDownloadEstimation()
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  it('initialises estimatedCount and estimatedSize to 0 and loading to false', () => {
    const { estimatedCount, estimatedSize, loading } = mountComposable()
    expect(estimatedCount.value).toBe(0)
    expect(estimatedSize.value).toBe(0)
    expect(loading.value).toBe(false)
  })

  it('exposes maxNbFiles and maxSizeBytes from core config', () => {
    const { maxNbFiles, maxSizeBytes } = mountComposable()
    expect(maxNbFiles.value).toBe(10)
    expect(maxSizeBytes.value).toBe(1024)
  })

  it('estimate() populates estimatedCount and estimatedSize from the search store', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockResolvedValue({
      estimatedCount: 5,
      estimatedSize: 50
    })

    const composable = mountComposable()
    const result = await composable.estimate()

    expect(result).toEqual({ estimatedCount: 5, estimatedSize: 50 })
    expect(composable.estimatedCount.value).toBe(5)
    expect(composable.estimatedSize.value).toBe(50)
  })

  it('toggles loading during the estimate() call', async () => {
    const searchStore = useSearchStore()
    let resolveFn
    vi.spyOn(searchStore, 'estimateDownloadSize').mockReturnValue(
      new Promise((resolve) => { resolveFn = resolve })
    )

    const composable = mountComposable()
    const promise = composable.estimate()
    expect(composable.loading.value).toBe(true)

    resolveFn({ estimatedCount: 0, estimatedSize: 0 })
    await promise
    expect(composable.loading.value).toBe(false)
  })

  it('resets loading to false and propagates errors when estimate() rejects', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockRejectedValue(new Error('boom'))

    const composable = mountComposable()
    await expect(composable.estimate()).rejects.toThrow('boom')
    expect(composable.loading.value).toBe(false)
  })

  it('exceedsFileLimit reflects estimatedCount > maxNbFiles', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockResolvedValue({
      estimatedCount: 11,
      estimatedSize: 0
    })

    const composable = mountComposable()
    await composable.estimate()
    await flushPromises()
    expect(composable.exceedsFileLimit.value).toBe(true)
    expect(composable.exceedsSizeLimit.value).toBe(false)
    expect(composable.exceedsLimit.value).toBe(true)
  })

  it('exceedsSizeLimit reflects estimatedSize > maxSizeBytes', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockResolvedValue({
      estimatedCount: 0,
      estimatedSize: 2048
    })

    const composable = mountComposable()
    await composable.estimate()
    await flushPromises()
    expect(composable.exceedsFileLimit.value).toBe(false)
    expect(composable.exceedsSizeLimit.value).toBe(true)
    expect(composable.exceedsLimit.value).toBe(true)
  })

  it('exceedsLimit is false when neither limit is exceeded', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockResolvedValue({
      estimatedCount: 1,
      estimatedSize: 1
    })

    const composable = mountComposable()
    await composable.estimate()
    await flushPromises()
    expect(composable.exceedsLimit.value).toBe(false)
  })

  it('formattedEstimatedSize and formattedMaxSize return humanized values', async () => {
    const searchStore = useSearchStore()
    vi.spyOn(searchStore, 'estimateDownloadSize').mockResolvedValue({
      estimatedCount: 0,
      estimatedSize: 2048
    })

    const composable = mountComposable()
    await composable.estimate()
    await flushPromises()
    expect(composable.formattedEstimatedSize.value).toBe('2 KB')
    expect(composable.formattedMaxSize.value).toBe('1 KB')
  })
})
