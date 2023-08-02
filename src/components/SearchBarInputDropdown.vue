<template>
  <b-dropdown
    :class="{
      'search-bar__field--selected': value !== 'all',
      'search-bar__field--disabled': disabled
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    class="search-bar-input-dropdown"
    menu-class="search-bar-input-dropdown__menu"
    toggle-class="d-inline-flex align-items-center"
    right
    variant="outline-light"
  >
    <template #button-content>
      <slot name="button-content" v-bind="{ value }">
        <span v-for="(value, v) in values" :key="v">
          {{ $t(fieldOptionsPathValue + value) }}
        </span>
      </slot>
    </template>
    <b-dropdown-item
      v-for="(option, o) in fieldOptions"
      :key="o"
      :active="hasValue(option)"
      class="search-bar-input-dropdown__option"
      @click="toggleValue(option)"
    >
      <slot name="dropdown-item" v-bind="{ option }">
        {{ $t(fieldOptionsPathValue + option) }}
      </slot>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import { castArray, includes, without } from 'lodash'

import settings from '@/utils/settings'

/**
 * The general search input dropdown.
 */
export default {
  name: 'SearchBarInputDropdown',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    /**
     * Search field configuration dictionary.
     */
    fieldOptions: {
      type: Array,
      default() {
        return settings.searchFields.map((field) => field.key)
      }
    },
    /**
     * Field option translation path
     */
    fieldOptionsPath: {
      type: Array,
      default: () => ['search', 'field']
    },
    /**
     * Selected value
     */
    value: {
      type: [String, Array],
      default: 'all'
    },
    /**
     * The select value can be a series values.
     */
    multiple: {
      type: Boolean
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
    }
  },
  computed: {
    fieldOptionsPathValue() {
      return `${this.fieldOptionsPath.join('.')}.`
    },
    values() {
      return castArray(this.value)
    },
    selectedValue: {
      get() {
        return this.multiple ? this.values : this.value
      },
      set(value) {
        this.$emit('update', value)
      }
    }
  },
  methods: {
    selectValue(value) {
      if (this.multiple) {
        this.selectedValue = [...this.values, value]
      } else {
        this.selectedValue = value
      }
    },
    unselectValue(value) {
      if (this.multiple && this.selectedValue.length > 1) {
        this.selectedValue = without(this.values, value)
      }
    },
    toggleValue(value) {
      return this.hasValue(value) ? this.unselectValue(value) : this.selectValue(value)
    },
    hasValue(value) {
      return this.multiple ? includes(this.values, value) : this.selectedValue === value
    }
  }
}
</script>

<style lang="scss">
.search-bar-input-dropdown {
  background: $input-bg;
  font-size: inherit;

  &:first-of-type {
    border-left: solid 1px $input-border-color;
  }

  &--selected:after {
    bottom: 1px;
    border: 2px solid $tertiary;
    content: '';
    left: 0;
    position: absolute;
    right: 1px;
    top: 1px;
  }

  .btn {
    border: 1px solid $input-border-color;
    border-left: 0;
    box-shadow: $input-box-shadow;
    color: $text-muted;

    .input-group-lg & {
      font-size: 1.25rem;
    }

    &.disabled,
    &.disabled:hover {
      opacity: 1;
      background: $light !important;
      color: $text-muted;
    }
  }

  &.show .btn.dropdown-toggle,
  & .btn.dropdown-toggle:hover,
  & .btn.dropdown-toggle:active {
    background: transparent;
    border: 1px solid $input-border-color;
    border-left: 0;
    box-shadow: $input-box-shadow;
  }

  &__menu {
    max-height: 70vh;
    overflow: auto;
  }
}
</style>
