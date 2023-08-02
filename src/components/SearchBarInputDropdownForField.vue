<template>
  <search-bar-input-dropdown
    v-model="selectedField"
    class="search-bar-input-dropdown-for-field"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :options-path="optionsPath"
  />
</template>

<script>
import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
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
    value: {
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
        return settings.searchFields.map((field) => field.key)
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
  computed: {
    selectedField: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
