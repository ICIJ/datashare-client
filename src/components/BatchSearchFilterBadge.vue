<template>
  <fa
    class="batch-search-filter-badge text-secondary"
    :class="{ 'batch-search-filter-badge--inactive': !active }"
    icon="circle"
    width="8px"
  ></fa>
</template>

<script>
export default {
  name: 'BatchSearchFilterBadge',
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="scss">
.batch-search-filter-badge--inactive {
  visibility: hidden;
}
</style>
