<template>
  <b-badge v-if="counter" variant="secondary" class="column-filter-badge__counter">
    {{ counter | humanNumber }}
  </b-badge>
  <fa
    v-else
    class="column-filter-badge text-secondary"
    :class="{ 'column-filter-badge--inactive': !active }"
    icon="circle"
    width="8px"
  ></fa>
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
  &--inactive {
    visibility: hidden;
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
