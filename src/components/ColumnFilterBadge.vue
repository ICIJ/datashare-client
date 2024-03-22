<template>
  <span class="column-filter-badge column-filter-badge" :class="{ 'column-filter-badge--inactive': !active }">
    <b-badge v-if="counter" variant="secondary" class="column-filter-badge column-filter-badge__counter">
      {{ counter | humanNumber }}
    </b-badge>
    <fa v-else-if="active" class="column-filter-badge__icon text-secondary" size="2xs" icon="circle" />
  </span>
</template>

<script>
import humanNumber from '@/filters/humanNumber'
export default {
  name: 'ColumnFilterBadge',
  filters: {
    humanNumber
  },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    counter: {
      type: Number,
      default: null
    }
  }
}
</script>
<style lang="scss" scoped>
.column-filter-badge {
  &__icon {
    vertical-align: top;
    margin-left: 0.1em;
  }

  &__counter {
    margin: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
    z-index: 100;
  }
}
</style>
