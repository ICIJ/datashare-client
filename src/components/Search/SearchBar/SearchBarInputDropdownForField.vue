<template>
  <search-bar-input-dropdown
    v-model="selectedField"
    class="search-bar-input-dropdown-for-field"
    placement="bottom-end"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :options-path="optionsPath"
    @hidden="$emit('hidden', $event)"
    @changed="$emit('changed', $event)"
  />
</template>

<script>
import SearchBarInputDropdown from '@/components/Search/SearchBar/SearchBarInputDropdown'
import settings from '@/utils/settings'

export default {
  name: 'SearchBarInputDropdownForField',
  components: {
    SearchBarInputDropdown
  },
  props: {
    /**
     * Selected field
     */
    modelValue: {
      type: String,
      required: true
    },
    /**
     * The dropdown toggler must be disabled.
     */
    disabled: {
      type: Boolean
    },
    /**
     * The caret in the dropdown toggler must be hidden.
     */
    noCaret: {
      type: Boolean
    },
    /**
     * Search field configuration dictionary.
     */
    options: {
      type: Array,
      default() {
        return settings.searchFields.map(field => field.key)
      }
    },
    /**
     * Field option translation path
     */
    optionsPath: {
      type: Array,
      default: () => ['search', 'field']
    }
  },
  emits: ['hidden', 'changed', 'update:modelValue'],
  computed: {
    selectedField: {
      immediate: true,
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>
