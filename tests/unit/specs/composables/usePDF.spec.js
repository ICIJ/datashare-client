import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { getDocument } from 'pdfjs-dist'

import CoreSetup from '~tests/unit/CoreSetup'
import { usePDF } from '@/composables/usePDF'

vi.mock('pdfjs-dist/build/pdf.worker.min?url', () => ({ default: 'worker.js' }))

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: 'worker.js' },
  version: '0'
}))

// useWait needs an active component instance.
function withUsePDF(src) {
  let api
  const Host = defineComponent({
    setup() {
      api = usePDF(src)
      return () => null
    }
  })
  const { plugins } = CoreSetup.init().useAll()
  mount(Host, { global: { plugins } })
  return api
}

describe('usePDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets error when the document fails to load', async () => {
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('415')) })
    const { error } = withUsePDF('http://preview/pdf')
    await flushPromises()
    expect(error.value.message).toBe('415')
  })

  it('resets error on a successful load', async () => {
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('415')) })
    const { error, load } = withUsePDF('http://preview/pdf')
    await flushPromises()
    const pdfDoc = { numPages: 0, destroy: vi.fn() }
    getDocument.mockReturnValue({ promise: Promise.resolve(pdfDoc) })
    await load('http://preview/other')
    expect(error.value).toBeNull()
  })

  it('ignores a failure from a previous source', async () => {
    let rejectStale
    const stale = new Promise((resolve, reject) => {
      rejectStale = reject
    })
    getDocument.mockReturnValue({ promise: stale, destroy: vi.fn() })
    const { error, load } = withUsePDF('http://preview/a')
    const pdfDoc = { numPages: 0, destroy: vi.fn() }
    getDocument.mockReturnValue({ promise: Promise.resolve(pdfDoc), destroy: vi.fn() })
    await load('http://preview/b')
    rejectStale(new Error('504'))
    await flushPromises()
    expect(error.value).toBeNull()
  })
})
