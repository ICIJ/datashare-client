import { computed, ref, toRef } from 'vue'

export function useSelection(initialSelection, initialValues = null) {
  const selection = initialSelection ? toRef(initialSelection) : ref([])
  const values = initialValues ? toRef(initialValues) : ref([])

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
    if (!selection.value.includes(value)) {
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
    } else {
      removeFromSelection(value)
    }
  }

  const isSelected = (value) => {
    return selection.value.includes(value)
  }

  const indeterminate = computed({
    get() {
      return selection.value.length && selection.value.length < values.value.length
    },
    set() {
      selectAll()
    }
  })

  const selectAll = () => {
    values.value.forEach(addToSelection)
  }

  const unselectAll = () => {
    values.value.forEach(removeFromSelection)
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
