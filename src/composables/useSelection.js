import { computed, ref, toRef } from 'vue'

export function useSelection(initialSelection, initialAll = []) {
  const selection = initialSelection ? toRef(initialSelection) : ref([])
  const all = toRef(initialAll)

  // Derived Set for O(1) lookups - stays in sync with selection array
  const selectionSet = computed(() => new Set(selection.value))

  const selectionValues = computed(() => {
    return new Proxy(Object.create(null), {
      get(_, value) {
        const parsedValue = isNaN(value) ? value : Number(value)
        return isSelected(parsedValue)
      },
      set(_, value, isSelected) {
        const parsedValue = isNaN(value) ? value : Number(value)
        toggleSelection(parsedValue, isSelected)
        return true
      }
    })
  })

  const addToSelection = (value) => {
    // Use Set for O(1) lookup
    if (!selectionSet.value.has(value)) {
      selection.value.push(value)
    }
  }

  const removeFromSelection = (value) => {
    const index = selection.value.indexOf(value)
    if (index !== -1) {
      selection.value.splice(index, 1)
    }
  }

  const toggleSelection = (value, isSelected) => {
    if (isSelected) {
      addToSelection(value)
    }
    else {
      removeFromSelection(value)
    }
  }

  const isSelected = (value) => {
    // O(1) lookup using Set instead of O(n) array.includes()
    return selectionSet.value.has(value)
  }

  const indeterminate = computed({
    get() {
      return !!selection.value.length && selection.value.length < all.value.length
    },
    set() {
      selectAll()
    }
  })

  const selectAll = () => {
    all.value.forEach(addToSelection)
  }

  const unselectAll = () => {
    all.value.forEach(removeFromSelection)
  }

  return {
    selection,
    selectionValues,
    isSelected,
    indeterminate,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    selectAll,
    unselectAll
  }
}
