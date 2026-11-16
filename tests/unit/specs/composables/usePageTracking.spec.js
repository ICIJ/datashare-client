import { effectScope } from 'vue'

import { usePageTracking } from '@/composables/usePageTracking'

describe('usePageTracking', () => {
  let scope
  let elements

  function setup() {
    elements = [1, 2, 3].map(() => ({ scrollIntoView: vi.fn() }))
    const getPageElement = value => elements[value - 1]
    return scope.run(() => usePageTracking({ getPageElement }))
  }

  beforeEach(() => {
    vi.useFakeTimers()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  it('starts on the first page', () => {
    const { page } = setup()
    expect(page.value).toBe(1)
  })

  it('follows the topmost visible page', () => {
    const { page, trackPage } = setup()
    trackPage(3, true)
    trackPage(2, true)
    expect(page.value).toBe(2)
    trackPage(2, false)
    expect(page.value).toBe(3)
  })

  it('keeps the current page when no page is visible', () => {
    const { page, trackPage } = setup()
    trackPage(2, true)
    trackPage(2, false)
    expect(page.value).toBe(2)
  })

  it('scrolls to the picked page', () => {
    const { page } = setup()
    page.value = 3
    expect(elements[2].scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    expect(page.value).toBe(3)
  })

  it('ignores a picked page that is not rendered', () => {
    const { page } = setup()
    page.value = 4
    expect(page.value).toBe(1)
  })

  it('keeps the picked page while the scroll runs past other pages', () => {
    const { page, trackPage } = setup()
    page.value = 3
    trackPage(2, true)
    expect(page.value).toBe(3)
  })

  it('realigns the picked page once the scroll settles', () => {
    const { page } = setup()
    page.value = 3
    window.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(200)
    expect(elements[2].scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'instant', block: 'start' })
  })

  it('follows the viewport once a held page settles without realigning', () => {
    const { page, trackPage, holdPageTracking } = setup()
    holdPageTracking(3)
    trackPage(2, true)
    vi.advanceTimersByTime(200)
    expect(elements[2].scrollIntoView).not.toHaveBeenCalled()
    expect(page.value).toBe(2)
  })

  it('holds the tracking without moving the indicator by default', () => {
    const { page, holdPageTracking } = setup()
    holdPageTracking(3)
    expect(page.value).toBe(1)
  })

  it('moves the indicator to the held page when asked to', () => {
    const { page, holdPageTracking } = setup()
    holdPageTracking(3, { jump: true })
    expect(page.value).toBe(3)
  })

  it.each(['wheel', 'touchmove', 'pointerdown'])('follows the viewport again on %s', (type) => {
    const { page, trackPage } = setup()
    page.value = 3
    trackPage(2, true)
    window.dispatchEvent(new Event(type))
    expect(page.value).toBe(2)
  })

  it('follows the viewport again when a key scrolls the document', () => {
    const { page, trackPage } = setup()
    page.value = 3
    trackPage(2, true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }))
    expect(page.value).toBe(2)
  })

  it('keeps the picked page when a space is typed in a form control', () => {
    const { page, trackPage } = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    page.value = 3
    trackPage(2, true)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(page.value).toBe(3)
    input.remove()
  })

  it('forgets the visible pages and the held page on reset', () => {
    const { page, trackPage, reset } = setup()
    trackPage(3, true)
    page.value = 2
    reset()
    trackPage(3, true)
    expect(page.value).toBe(3)
  })

  it('keeps the current page on reset', () => {
    const { page, reset } = setup()
    page.value = 2
    reset()
    expect(page.value).toBe(2)
  })

  it('moves to the given page on reset', () => {
    const { page, reset } = setup()
    page.value = 2
    reset(1)
    expect(page.value).toBe(1)
  })
})
