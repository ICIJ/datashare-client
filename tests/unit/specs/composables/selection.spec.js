import { ref } from 'vue'

import { useSelection } from '@/composables/selection'

describe('useSelection composable', () => {
  it('should initialize with an empty selection', () => {
    const { selection } = useSelection()
    expect(selection.value).toEqual([])
  })

  it('should initialize with a given selection', () => {
    const initialSelection = ref([1, 2, 3])
    const { selection } = useSelection(initialSelection)
    expect(selection.value).toEqual([1, 2, 3])
  })

  it('should add value to selection', () => {
    const { selection, addToSelection } = useSelection()
    addToSelection(1)
    expect(selection.value).toEqual([1])
  })

  it('should not add duplicate values to selection', () => {
    const { selection, addToSelection } = useSelection()
    addToSelection(1)
    addToSelection(1)
    expect(selection.value).toEqual([1])
  })

  it('should remove value from selection', () => {
    const { selection, addToSelection, removeFromSelection } = useSelection()
    addToSelection(1)
    removeFromSelection(1)
    expect(selection.value).toEqual([])
  })

  it('should not remove value that is not in selection', () => {
    const { selection, addToSelection, removeFromSelection } = useSelection()
    addToSelection(1)
    removeFromSelection(2)
    expect(selection.value).toEqual([1])
  })

  it('should toggle selection correctly', () => {
    const { selection, toggleSelection } = useSelection()
    toggleSelection(1, true)
    expect(selection.value).toEqual([1])

    toggleSelection(1, false)
    expect(selection.value).toEqual([])
  })

  it('should correctly identify if a value is selection', () => {
    const { addToSelection, isSelection } = useSelection()
    addToSelection(1)
    expect(isSelection(1)).toBe(true)
    expect(isSelection(2)).toBe(false)
  })

  it('should correctly get and set selectionValues via proxy', () => {
    const { selection, selectionValues } = useSelection()

    // Use proxy to set selection
    selectionValues.value[1] = true
    expect(selection.value).toEqual([1])

    // Use proxy to unset selection
    selectionValues.value['1'] = false
    expect(selection.value).toEqual([])
  })
})
