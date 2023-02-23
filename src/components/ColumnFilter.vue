<template>
  <div class="column-filter d-flex align-items-baseline">
    <span class="column-filter__label">
      {{ name }}
    </span>
    <b-btn :id="btnId" class="column-filter__toggle" :class="btnClassName" radius variant="outline">
      <fa icon="filter" />
    </b-btn>
    <column-filter-badge :active="active" />
    <b-popover custom-class="column-filter__popover popover-white popover-body-p-0" :target="btnId" triggers="focus">
      <slot></slot>
    </b-popover>
  </div>
</template>

<script>
import ColumnFilterBadge from '@/components/ColumnFilterBadge'

export default {
  name: 'ColumnFilter',
  components: {
    ColumnFilterBadge
  },
  model: {
    prop: 'selectedValues',
    event: 'update'
  },
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    btnClassName() {
      return `column-filter__toggle--${this.id}`
    },
    btnId() {
      return `${this.btnClassName}-id`
    }
  }
}
</script>
<style lang="scss" scoped>
.column-filter {
  &__toggle {
    padding: 0 0.2em;
    margin: 0 0 0 1em;
    line-height: 1.3em;
  }
}
</style>
