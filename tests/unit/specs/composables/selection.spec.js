import { useSelection } from '@/composables/selection'
import { ref } from 'vue'

describe('useSelection composable', () => {
  it('should initialize with an empty selection', () => {
    const { selected } = useSelection()
    expect(selected.value).toEqual([])
  })

  it('should initialize with a given selection', () => {
    const initialSelected = ref([1, 2, 3])
    const { selected } = useSelection(initialSelected)
    expect(selected.value).toEqual([1, 2, 3])
  })

  it('should add value to selected', () => {
    const { selected, addToSelected } = useSelection()
    addToSelected(1)
    expect(selected.value).toEqual([1])
  })

  it('should not add duplicate values to selected', () => {
    const { selected, addToSelected } = useSelection()
    addToSelected(1)
    addToSelected(1)
    expect(selected.value).toEqual([1])
  })

  it('should remove value from selected', () => {
    const { selected, addToSelected, removeFromSelected } = useSelection()
    addToSelected(1)
    removeFromSelected(1)
    expect(selected.value).toEqual([])
  })

  it('should not remove value that is not in selected', () => {
    const { selected, addToSelected, removeFromSelected } = useSelection()
    addToSelected(1)
    removeFromSelected(2)
    expect(selected.value).toEqual([1])
  })

  it('should toggle selection correctly', () => {
    const { selected, toggleSelection } = useSelection()
    toggleSelection(1, true)
    expect(selected.value).toEqual([1])

    toggleSelection(1, false)
    expect(selected.value).toEqual([])
  })

  it('should correctly identify if a value is selected', () => {
    const { addToSelected, isSelected } = useSelection()
    addToSelected(1)
    expect(isSelected(1)).toBe(true)
    expect(isSelected(2)).toBe(false)
  })

  it('should correctly get and set selectedValues via proxy', () => {
    const { selected, selectedValues } = useSelection()

    // Use proxy to set selection
    selectedValues.value[1] = true
    expect(selected.value).toEqual([1])

    // Use proxy to unset selection
    selectedValues.value['1'] = false
    expect(selected.value).toEqual([])
  })
})
