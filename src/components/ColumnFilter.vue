<template>
  <div class="column-filter d-flex align-items-baseline">
    <span class="column-filter__label">
      {{ name }}
    </span>
    <b-btn :id="btnId" class="column-filter__toggle" :class="btnClassName" radius variant="outline">
      <fa icon="filter" />
      <slot name="badge" :active="active" :counter="counter">
        <column-filter-badge :active="active" :counter="counter" />
      </slot>
    </b-btn>
    <b-popover :custom-class="popoverClassList" :target="btnId" triggers="click blur" lazy>
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
    },
    counter: {
      type: Number,
      default: null
    },
    popoverWhite: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    btnClassName() {
      return `column-filter__toggle--${this.id}`
    },
    btnId() {
      return `${this.btnClassName}-id`
    },
    popoverClassList() {
      return `column-filter__popover popover-body-p-0 ${this.popoverWhite ? 'popover-white' : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
.column-filter {
  &__toggle {
    position: relative;
    padding: 0 0.2em;
    margin: 0 0 0 1em;
    line-height: 1.3em;
  }
}
</style>
