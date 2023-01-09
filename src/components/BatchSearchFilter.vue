<template>
  <div class="batch-search-filter d-flex align-items-baseline">
    <span class="batch-search-filter__label">
      {{ name }}
    </span>
    <b-btn :id="btnId" class="batch-search-filter__toggle" :class="btnClassName" radius variant="outline">
      <fa icon="filter" />
    </b-btn>
    <batch-search-filter-badge :active="active" />
    <b-popover
      custom-class="batch-search-filter__popover popover-white popover-body-p-0"
      :target="btnId"
      triggers="focus"
    >
      <slot></slot>
    </b-popover>
  </div>
</template>

<script>
import BatchSearchFilterBadge from '@/components/BatchSearchFilterBadge'

export default {
  name: 'BatchSearchFilter',
  components: {
    BatchSearchFilterBadge
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
      return `batch-search-filter__toggle--${this.id}`
    },
    btnId() {
      return `${this.btnClassName}-id`
    }
  }
}
</script>
<style lang="scss" scoped>
.batch-search-filter {
  &__toggle {
    padding: 0 0.2em;
    margin: 0 0 0 1em;
    line-height: 1.3em;
  }
}
</style>
