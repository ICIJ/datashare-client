import { computed } from 'vue'
import { castArray, isEqual } from 'lodash'

// Resolve a stable key from an option. `optionKey` is either a property
// name (string), a getter function, or null/undefined for identity.
function resolveKey(option, optionKey) {
  if (typeof optionKey === 'function') {
    return optionKey(option)
  }
  if (typeof optionKey === 'string') {
    return option?.[optionKey]
  }
  return option
}

/**
 * Selection logic shared by every dropdown selector.
 *
 * @param {import('vue').Ref} modelValue reactive model value (from defineModel)
 * @param {import('vue').Ref} allOptions reactive list of every selectable option
 * @param {Object} config
 * @param {import('vue').Ref<Boolean>} config.multiple whether selection is multiple
 * @param {String|Function} config.optionKey how to derive a key from an option
 */
export function useDropdownSelection(modelValue, allOptions, { multiple, optionKey }) {
  const keyOf = option => resolveKey(option, optionKey)

  // Current selection as an array, regardless of single/multiple mode.
  const selectedValues = computed(() => {
    if (modelValue.value === null || modelValue.value === undefined) {
      return []
    }
    return castArray(modelValue.value)
  })

  const selectedKeys = computed(() => selectedValues.value.map(keyOf))

  const isSelected = (option) => {
    const key = keyOf(option)
    return selectedKeys.value.some(selectedKey => isEqual(selectedKey, key))
  }

  // A selected option in multiple mode can't be unselected if it's the last one.
  const isRequiredSelection = (option) => {
    return multiple.value && isSelected(option) && selectedValues.value.length <= 1
  }

  // Replace the whole model value, honouring single vs multiple mode.
  const setSelection = (values) => {
    modelValue.value = multiple.value ? values : (values[0] ?? null)
  }

  const selectValue = (option) => {
    if (multiple.value) {
      setSelection([...selectedValues.value, option])
    }
    else {
      setSelection([option])
    }
  }

  const unselectValue = (option) => {
    // A multiple selection must always keep at least one value.
    if (multiple.value && selectedValues.value.length > 1) {
      const remaining = selectedValues.value.filter(value => !isEqual(keyOf(value), keyOf(option)))
      setSelection(remaining)
    }
  }

  // Toggle a value while keeping every other selected value (multiple mode).
  const toggleValue = (event, option) => {
    if (multiple.value) {
      event?.stopPropagation?.()
    }
    if (isSelected(option)) {
      unselectValue(option)
    }
    else {
      selectValue(option)
    }
  }

  // Toggle a value as the ONLY selected value (single-select behaviour even in multiple mode).
  const toggleUniqueValue = (event, option) => {
    if (isSelected(option)) {
      unselectValue(option)
    }
    else {
      setSelection([option])
    }
  }

  const selectAll = () => {
    setSelection([...allOptions.value])
  }

  const unselectAll = () => {
    // Keep the first option so a multiple selection never becomes empty.
    setSelection(allOptions.value.slice(0, 1))
  }

  return {
    keyOf,
    selectedValues,
    selectedKeys,
    isSelected,
    isRequiredSelection,
    selectValue,
    unselectValue,
    toggleValue,
    toggleUniqueValue,
    selectAll,
    unselectAll
  }
}

export default useDropdownSelection
