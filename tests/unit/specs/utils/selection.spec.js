import { hasSelectionWithin } from '@/utils/selection'

describe('utils/selection', () => {
  let element

  beforeEach(() => {
    element = document.createElement('div')
    element.textContent = 'foo'
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    vi.restoreAllMocks()
  })

  const mockSelection = selection => vi.spyOn(window, 'getSelection').mockReturnValue(selection)

  it('is false without any selection', () => {
    mockSelection(null)

    expect(hasSelectionWithin(element)).toBe(false)
  })

  it('is false for a collapsed selection, which is only a caret', () => {
    mockSelection({ isCollapsed: true, anchorNode: element })

    expect(hasSelectionWithin(element)).toBe(false)
  })

  it('is false when the selection is anchored outside the element', () => {
    mockSelection({ isCollapsed: false, anchorNode: document.body })

    expect(hasSelectionWithin(element)).toBe(false)
  })

  it('is true when the selection is anchored inside the element', () => {
    mockSelection({ isCollapsed: false, anchorNode: element.firstChild })

    expect(hasSelectionWithin(element)).toBe(true)
  })

  it('is false without an element to compare the selection against', () => {
    mockSelection({ isCollapsed: false, anchorNode: element })

    expect(hasSelectionWithin(null)).toBe(false)
  })
})
