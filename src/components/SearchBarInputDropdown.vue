<template>
  <b-dropdown
    ref="dropdown"
    v-model="visible"
    :class="{
      'search-bar__field--selected': modelValue !== 'all',
      'search-bar__field--disabled': disabled
    }"
    :disabled="disabled"
    :end="end"
    no-caret
    class="search-bar-input-dropdown"
    menu-class="search-bar-input-dropdown__menu"
    toggle-class="d-inline-flex align-items-center"
    boundary="viewport"
    teleport-to="body"
    variant="outline-tertiary"
    @shown="shown"
    @hidden="hidden"
  >
    <template #button-content>
      <slot name="button-content" :dropdown="dropdown">
        <span v-for="v in modelValues" :key="v">
          {{ $t(optionsPathValue + v) }}
        </span>
      </slot>
      <template v-if="!noCaret">
        <phosphor-icon name="caret-down" class="ms-2" />
      </template>
    </template>
    <!-- @slot Area to insert content above the dropdown -->
    <slot name="above" :dropdown="dropdown" :visible="visible"></slot>
    <b-dropdown-item
      v-for="(option, index) in options"
      :key="index"
      :active="hasValue(option)"
      :link-class="linkClass"
      class="search-bar-input-dropdown__option"
      @click="toggleUniqueValue($event, option)"
    >
      <slot name="dropdown-item" v-bind="{ option, index, modelValues, hasValue, toggleValue, toggleUniqueValue }">
        <span class="px-3 d-block" @click="toggleValue($event, option)">
          {{ $t(optionsPathValue + option) }}
        </span>
      </slot>
    </b-dropdown-item>
    <!-- @slot Area to insert content bellow the dropdown -->
    <slot name="bellow" :dropdown="dropdown" :visible="visible"></slot>
  </b-dropdown>
</template>

<script>
import { castArray, cloneDeep, includes, isEqual, without } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'

/**
 * The general search input dropdown.
 */
export default {
  name: 'SearchBarInputDropdown',
  components: {
    PhosphorIcon
  },
  props: {
    /**
     * Options list.
     */
    options: {
      type: Array,
      default: () => []
    },
    /**
     * Translation path for each option value.
     */
    optionsPath: {
      type: Array,
      default: () => []
    },
    /**
     * Selected value
     */
    modelValue: {
      type: [String, Array],
      default: 'all',
      required: true
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
     * Align dropdown to the end
     */
    end: {
      type: Boolean
    },
    /**
     * The caret in the dropdown toggler must be hidden.
     */
    noCaret: {
      type: Boolean
    },
    /**
     * Remove padding on items
     */
    flushItems: {
      type: Boolean
    }
  },
  emits: ['hide', 'changed', 'selected', 'update:modelValue'],
  data() {
    return {
      visible: false,
      // A reactive property to hold the reference to the dropdown
      // after the component is mounted
      dropdown: null,
      // Initial value when the dropdown is shown
      initialValue: null
    }
  },
  computed: {
    optionsPathValue() {
      return `${this.optionsPath.join('.')}.`
    },
    modelValues() {
      return castArray(this.modelValue)
    },
    selectedValue: {
      get() {
        return this.multiple ? this.modelValues : this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    linkClass() {
      return { 'p-0': this.flushItems }
    },
    valueChanged() {
      return !isEqual(this.initialValue, this.modelValue)
    }
  },
  watch: {
    selectedValue() {
      this.$emit('selected', this.selectedValue)
    }
  },
  async mounted() {
    await this.$nextTick()
    this.dropdown = this.$refs.dropdown
  },
  methods: {
    selectValue(value) {
      if (this.multiple) {
        this.selectedValue = [...this.modelValues, value]
      } else {
        this.selectedValue = value
      }
    },
    unselectValue(value) {
      if (this.multiple && this.selectedValue.length > 1) {
        this.selectedValue = without(this.modelValues, value)
      }
    },
    setValue(event, value) {
      if (this.multiple) {
        this.selectedValue = [value]
      } else {
        this.selectedValue = value
      }
    },
    toggleUniqueValue(event, value) {
      if (this.hasValue(value)) {
        return this.unselectValue(value)
      }
      return this.setValue(event, value)
    },
    toggleValue(event, value) {
      if (this.multiple) {
        event.stopPropagation()
      }
      return this.hasValue(value) ? this.unselectValue(value) : this.selectValue(value)
    },
    hasValue(value) {
      return includes(this.modelValues, value)
    },
    hide() {
      return this.$refs.dropdown.hide()
    },
    hidden($event) {
      this.$emit('hide', $event)
      // When the value changed,
      // the component emit a second event.
      if (this.valueChanged) {
        this.$emit('changed', $event)
      }
    },
    shown() {
      this.initialValue = cloneDeep(this.modelValue)
    }
  }
}
</script>

<style lang="scss">
.search-bar-input-dropdown {
  background: $input-bg;
  font-size: inherit;

  &--selected:after {
    bottom: 1px;
    border: 2px solid $secondary;
    content: '';
    left: 0;
    position: absolute;
    right: 1px;
    top: 1px;
  }

  .btn {
    display: inline-flex;
    justify-content: center;
    white-space: nowrap;
    flex-wrap: nowrap;

    .input-group-lg & {
      font-size: 1.25rem;
    }

    &.disabled,
    &.disabled:hover {
      opacity: 1;
      background: $tertiary !important;
      color: $text-muted;
    }
  }

  &__menu {
    max-height: 50vh;
    overflow: auto;
  }
}
</style>
