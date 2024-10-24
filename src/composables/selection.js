import { computed, ref } from 'vue'

export function useSelection(initialSelected = null) {
  const selected = initialSelected ?? ref([])

  const selectedValues = computed(() => {
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

  const addToSelected = (value) => {
    if (!selected.value.includes(value)) {
      selected.value.push(value)
    }
  }

  const removeFromSelected = (value) => {
    const index = selected.value.indexOf(value)
    if (index !== -1) {
      selected.value.splice(index, 1)
    }
  }

  const toggleSelection = (value, isSelected) => {
    if (isSelected) {
      addToSelected(value)
    } else {
      removeFromSelected(value)
    }
  }

  const isSelected = (value) => {
    return selected.value.includes(value)
  }

  return {
    selected,
    selectedValues,
    isSelected,
    addToSelected,
    removeFromSelected,
    toggleSelection
  }
}
