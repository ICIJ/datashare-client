<template>
  <fa
    class="column-filter-badge text-secondary"
    :class="{ 'column-filter-badge--inactive': !active }"
    icon="circle"
    width="8px"
  ></fa>
</template>

<script>
export default {
  name: 'ColumnFilterBadge',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="scss">
.column-filter-badge--inactive {
  visibility: hidden;
}
</style>
