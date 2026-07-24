import { ref } from 'vue'

import { useListNavigation } from '@/composables/useListNavigation'

describe('useListNavigation', () => {
  it('starts with no focused item', () => {
    const { focusIndex } = useListNavigation(ref(['a', 'b', 'c']))
    expect(focusIndex.value).toBe(-1)
  })

  it('moves focus down and up within bounds', () => {
    const { focusIndex, moveFocusDown, moveFocusUp } = useListNavigation(ref(['a', 'b']))
    moveFocusDown()
    expect(focusIndex.value).toBe(0)
    moveFocusDown()
    expect(focusIndex.value).toBe(1)
    moveFocusDown()
    expect(focusIndex.value).toBe(1)
    moveFocusUp()
    moveFocusUp()
    moveFocusUp()
    expect(focusIndex.value).toBe(-1)
  })

  it('calls onEnter with the focused item', () => {
    const onEnter = vi.fn()
    const { moveFocusDown, selectFocused } = useListNavigation(ref(['a', 'b']), { onEnter })
    moveFocusDown()
    const event = { type: 'keydown' }
    selectFocused(event)
    expect(onEnter).toHaveBeenCalledWith(event, 'a')
  })

  it('does not call onEnter when nothing is focused', () => {
    const onEnter = vi.fn()
    const { selectFocused } = useListNavigation(ref(['a']), { onEnter })
    selectFocused({})
    expect(onEnter).not.toHaveBeenCalled()
  })
})
