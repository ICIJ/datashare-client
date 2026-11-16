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
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('415')), destroy: vi.fn() })
    const { error } = withUsePDF('http://preview/pdf')
    await flushPromises()
    expect(error.value.message).toBe('415')
  })

  it('resets error on a successful load', async () => {
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('415')), destroy: vi.fn() })
    const { error, load } = withUsePDF('http://preview/pdf')
    await flushPromises()
    const pdfDoc = { numPages: 0, destroy: vi.fn() }
    getDocument.mockReturnValue({ promise: Promise.resolve(pdfDoc), destroy: vi.fn() })
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

  it('ignores a success from a previous source', async () => {
    let resolveStale
    const stale = new Promise((resolve) => {
      resolveStale = resolve
    })
    getDocument.mockReturnValue({ promise: stale, destroy: vi.fn() })
    const { pdfDoc, load } = withUsePDF('http://preview/a')
    const fresh = { numPages: 0, destroy: vi.fn() }
    getDocument.mockReturnValue({ promise: Promise.resolve(fresh), destroy: vi.fn() })
    await load('http://preview/b')
    resolveStale({ numPages: 0, destroy: vi.fn() })
    await flushPromises()
    expect(pdfDoc.value).toBe(fresh)
  })

  it('destroys the previous loading task when another source loads', async () => {
    const previous = { promise: new Promise(() => {}), destroy: vi.fn() }
    getDocument.mockReturnValue(previous)
    const { load } = withUsePDF('http://preview/a')
    getDocument.mockReturnValue({ promise: Promise.resolve({ numPages: 0 }), destroy: vi.fn() })
    await load('http://preview/b')
    expect(previous.destroy).toHaveBeenCalled()
  })

  it('forgets the previous document when the next one fails', async () => {
    getDocument.mockReturnValue({ promise: Promise.resolve({ numPages: 0 }), destroy: vi.fn() })
    const { pdfDoc, load } = withUsePDF('http://preview/a')
    await flushPromises()
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('404')), destroy: vi.fn() })
    await load('http://preview/b')
    expect(pdfDoc.value).toBeNull()
  })
})
