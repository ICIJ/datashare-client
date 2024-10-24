import { computed, ref } from 'vue'

export function useSelection(initialSelection = null) {
  const selection = initialSelection ?? ref([])

  const selectionValues = computed(() => {
    return new Proxy(Object.create(null), {
      get(_, value) {
        const parsedValue = isNaN(value) ? value : Number(value)
        return isSelection(parsedValue)
      },
      set(_, value, isSelection) {
        const parsedValue = isNaN(value) ? value : Number(value)
        toggleSelection(parsedValue, isSelection)
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

  const toggleSelection = (value, isSelection) => {
    if (isSelection) {
      addToSelection(value)
    } else {
      removeFromSelection(value)
    }
  }

  const isSelection = (value) => {
    return selection.value.includes(value)
  }

  return {
    selection,
    selectionValues,
    isSelection,
    addToSelection,
    removeFromSelection,
    toggleSelection
  }
}
