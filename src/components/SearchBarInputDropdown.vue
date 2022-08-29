<template>
  <b-dropdown :class="{ 'search-bar__field--selected': selectedField !== 'all' }" :text="$t(fieldOptionsPathValue + selectedField)"
              class="search-bar-input-fields" right
              variant="outline-light">
    <b-dropdown-item
      v-for="key in fieldOptions"
      :key="key"
      class="search-bar-input-fields__option"
      @click="selectedField = key">
      {{ $t(fieldOptionsPathValue + key) }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import settings from '@/utils/settings'

/**
 * The general search input dropdown.
 */
export default {
  name: 'SearchBarInputDropdown',
  model: {
    prop: 'field',
    event: 'update'
  },
  props: {
    /**
     * Search field configuration dictionary.
     */
    fieldOptions: {
      type: Array,
      default () {
        return settings.searchFields.map(field => field.key)
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
     * Selected field value
     */
    field: {
      type: String,
      default: 'all'
    }
  },
  computed: {
    fieldOptionsPathValue () {
      return `${this.fieldOptionsPath.join('.')}.`
    },
    selectedField: {
      get () {
        return this.field
      },
      set (value) {
        this.$emit('update', value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-bar-input-fields {
      background: $input-bg;
      border-left: dashed 1px  $input-border-color;
      font-size: inherit;

      &--selected:after {
        bottom: 1px;
        border: 2px solid $tertiary;
        content: "";
        left: 0;
        position: absolute;
        right: 1px;
        top: 1px;
      }

      &:deep(.btn) {
        border: 1px solid $input-border-color;
        border-left: 0;
        box-shadow: $input-box-shadow;
        color: $text-muted;

        .input-group-lg & {
          font-size: 1.25rem;
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
}

</style>
