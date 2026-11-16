import { flushPromises } from '@vue/test-utils'
import { effectScope, shallowRef } from 'vue'

import { useDocumentBlur } from '@/composables/useDocumentBlur'

const { isBlurred, getBlurredContentBanner } = vi.hoisted(() => ({
  isBlurred: vi.fn(),
  getBlurredContentBanner: vi.fn()
}))

vi.mock('@/composables/useDocumentPreview', () => ({
  useDocumentPreview: () => ({ isBlurred, getBlurredContentBanner })
}))

describe('useDocumentBlur', () => {
  let scope

  function setup(document, options) {
    return scope.run(() => useDocumentBlur(document, options))
  }

  beforeEach(() => {
    vi.clearAllMocks()
    scope = effectScope()
    getBlurredContentBanner.mockResolvedValue('Sensitive')
  })

  afterEach(() => {
    scope.stop()
  })

  it('is unknown until the banners are fetched', () => {
    isBlurred.mockResolvedValue(true)
    const { blurred } = setup(shallowRef({ id: 'a' }))
    expect(blurred.value).toBeNull()
  })

  it('starts from the given initial value', () => {
    isBlurred.mockResolvedValue(false)
    const { blurred } = setup(shallowRef({ id: 'a' }), { initial: true })
    expect(blurred.value).toBe(true)
  })

  it('blurs a sensitive document with its banner', async () => {
    isBlurred.mockResolvedValue(true)
    const { blurred, blurredContent } = setup(shallowRef({ id: 'a' }))
    await flushPromises()
    expect(blurred.value).toBe(true)
    expect(blurredContent.value).toBe('Sensitive')
  })

  it('does not fetch the banner of a document that is not blurred', async () => {
    isBlurred.mockResolvedValue(false)
    const { blurred, blurredContent } = setup(shallowRef({ id: 'a' }))
    await flushPromises()
    expect(blurred.value).toBe(false)
    expect(blurredContent.value).toBeNull()
    expect(getBlurredContentBanner).not.toHaveBeenCalled()
  })

  it('checks again when the document changes', async () => {
    isBlurred.mockResolvedValue(true)
    const document = shallowRef({ id: 'a' })
    const { blurred } = setup(document)
    await flushPromises()
    blurred.value = false
    isBlurred.mockResolvedValue(true)
    document.value = { id: 'b' }
    await flushPromises()
    expect(blurred.value).toBe(true)
  })

  it('goes back to the initial value when the document changes', async () => {
    isBlurred.mockResolvedValue(false)
    const document = shallowRef({ id: 'a' })
    const { blurred } = setup(document, { initial: true })
    await flushPromises()
    isBlurred.mockReturnValue(new Promise(() => {}))
    document.value = { id: 'b' }
    await flushPromises()
    expect(blurred.value).toBe(true)
  })

  it('exposes the error when the banners cannot be fetched', async () => {
    const failure = new Error('Unavailable')
    isBlurred.mockRejectedValue(failure)
    const { blurred, error } = setup(shallowRef({ id: 'a' }), { initial: true })
    await flushPromises()
    expect(error.value).toBe(failure)
    expect(blurred.value).toBe(true)
  })

  it('clears the error once a document is checked', async () => {
    isBlurred.mockRejectedValueOnce(new Error('Unavailable'))
    isBlurred.mockResolvedValue(false)
    const document = shallowRef({ id: 'a' })
    const { error } = setup(document)
    await flushPromises()
    document.value = { id: 'b' }
    await flushPromises()
    expect(error.value).toBeNull()
  })

  it('ignores the answer for a document swapped out meanwhile', async () => {
    let resolveFirst
    isBlurred.mockReturnValueOnce(new Promise((resolve) => {
      resolveFirst = resolve
    }))
    isBlurred.mockResolvedValueOnce(false)
    const document = shallowRef({ id: 'a' })
    const { blurred } = setup(document)
    document.value = { id: 'b' }
    await flushPromises()
    resolveFirst(true)
    await flushPromises()
    expect(blurred.value).toBe(false)
  })
})
